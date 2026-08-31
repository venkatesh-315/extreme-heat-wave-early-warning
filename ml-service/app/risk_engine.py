"""
Deterministic Risk-Decision Engine for ThermoGuard ML Service
Evaluates multi-parametric human thermal hazards and outputs:
- combined risk score (0 - 100)
- standardized risk level (VERY_LOW, LOW, MODERATE, HIGH, EXTREME)
- prioritized administrative decision-support recommendations

Zero background polling, zero recursive execution, fully deterministic.
"""

import math
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

from .risk_config import (
    RiskLevel,
    RiskEngineConfig,
    RiskThresholdConfig,
    RiskWeightConfig,
    AdministrativeAction,
    DECISION_SUPPORT_DISCLAIMER,
)


@dataclass
class RiskDecisionResult:
    """
    Structured outcome of the deterministic risk-decision evaluation.
    """
    combined_risk_score: float
    risk_level: str
    recommended_actions: List[str]
    action_details: List[Dict[str, Any]]
    disclaimer: str
    thermal_stress: float
    mortality_risk: float
    hospitalization_risk: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "combined_risk_score": self.combined_risk_score,
            "risk_level": self.risk_level,
            "recommended_actions": self.recommended_actions,
            "action_details": self.action_details,
            "disclaimer": self.disclaimer,
            "input_metrics": {
                "thermal_stress": self.thermal_stress,
                "mortality_risk": self.mortality_risk,
                "hospitalization_risk": self.hospitalization_risk,
            },
        }


def _validate_risk_metric(value: float, name: str) -> float:
    """Validates that an input metric is a finite number in [0.0, 100.0]."""
    if value is None:
        raise ValueError(f"'{name}' is required and cannot be None.")
    try:
        val = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{name}' must be a valid numeric value, received {value}.")

    if math.isnan(val):
        raise ValueError(f"'{name}' must be a valid number, received NaN.")
    if math.isinf(val):
        raise ValueError(f"'{name}' must be a finite number, received Infinity.")
    if val < 0.0 or val > 100.0:
        raise ValueError(f"'{name}' must be bounded between 0.0 and 100.0, received {val}.")
    return val


def classify_risk_level(score: float, thresholds: Optional[RiskThresholdConfig] = None) -> RiskLevel:
    """
    Deterministically maps a combined score to a RiskLevel enum based on configurable boundaries.
    Left-inclusive, right-exclusive for intermediate tiers:
      [0.0, very_low_max) -> VERY_LOW
      [very_low_max, low_max) -> LOW
      [low_max, moderate_max) -> MODERATE
      [moderate_max, high_max) -> HIGH
      [high_max, extreme_max] -> EXTREME
    """
    thresholds = thresholds or RiskThresholdConfig()
    score_clamped = max(0.0, min(thresholds.extreme_max, float(score)))

    if score_clamped < thresholds.very_low_max:
        return RiskLevel.VERY_LOW
    elif score_clamped < thresholds.low_max:
        return RiskLevel.LOW
    elif score_clamped < thresholds.moderate_max:
        return RiskLevel.MODERATE
    elif score_clamped < thresholds.high_max:
        return RiskLevel.HIGH
    else:
        return RiskLevel.EXTREME


def compute_combined_risk_score(
    thermal_stress: float,
    mortality_risk: float,
    hospitalization_risk: float,
    weights: Optional[RiskWeightConfig] = None,
) -> float:
    """
    Computes weighted multi-factor combined risk score in [0.0, 100.0].
    """
    weights = weights or RiskWeightConfig()
    ts = _validate_risk_metric(thermal_stress, "thermal_stress")
    mr = _validate_risk_metric(mortality_risk, "mortality_risk")
    hr = _validate_risk_metric(hospitalization_risk, "hospitalization_risk")

    raw_score = (
        weights.thermal_stress_weight * ts
        + weights.mortality_risk_weight * mr
        + weights.hospitalization_risk_weight * hr
    )

    # Peak hazard floor: if any individual component is critically high (e.g. >= 85),
    # the composite score ensures safety by reflecting at least 85% of that critical peak.
    peak_hazard = max(ts, mr, hr)
    if peak_hazard >= 85.0:
        raw_score = max(raw_score, peak_hazard * 0.90)

    score = round(max(0.0, min(100.0, raw_score)), 1)
    return score


def evaluate_risk_decision(
    thermal_stress: float,
    mortality_risk: float,
    hospitalization_risk: float,
    config: Optional[RiskEngineConfig] = None,
) -> RiskDecisionResult:
    """
    Main entry point for the deterministic risk-decision engine.
    Calculates combined risk score, determines risk level, and compiles
    prioritized administrative decision-support actions.
    """
    config = config or RiskEngineConfig()

    ts = _validate_risk_metric(thermal_stress, "thermal_stress")
    mr = _validate_risk_metric(mortality_risk, "mortality_risk")
    hr = _validate_risk_metric(hospitalization_risk, "hospitalization_risk")

    # 1. Compute Combined Score
    combined_score = compute_combined_risk_score(ts, mr, hr, config.weights)

    # 2. Determine Risk Level
    risk_level_enum = classify_risk_level(combined_score, config.thresholds)
    risk_level_str = risk_level_enum.value

    # 3. Compile Administrative Decision-Support Recommendations
    actions_for_tier: List[AdministrativeAction] = config.actions.get(risk_level_enum, [])

    recommended_titles = [act.title for act in actions_for_tier]
    action_details = [
        {
            "action_id": act.action_id,
            "title": act.title,
            "priority": act.priority,
            "description": act.description,
            "target_sectors": act.target_sectors,
        }
        for act in actions_for_tier
    ]

    return RiskDecisionResult(
        combined_risk_score=combined_score,
        risk_level=risk_level_str,
        recommended_actions=recommended_titles,
        action_details=action_details,
        disclaimer=config.disclaimer,
        thermal_stress=ts,
        mortality_risk=mr,
        hospitalization_risk=hr,
    )
