"""
Unit Tests for Deterministic Risk-Decision Engine (tests/test_risk_engine.py)
Validates:
- Every threshold boundary condition (0-20 VERY_LOW, 20-40 LOW, 40-60 MODERATE, 60-80 HIGH, 80-100 EXTREME)
- Custom configurable thresholds and weight adjustments
- Strict input validation rejecting NaN, Infinity, negative, and out-of-range values
- Prioritized administrative action recommendation generation across all tiers
- Non-medical decision-support disclaimer integrity
- Determinism and zero side effects
"""

import unittest
import math
from app.risk_config import (
    RiskLevel,
    RiskThresholdConfig,
    RiskWeightConfig,
    RiskEngineConfig,
    DECISION_SUPPORT_DISCLAIMER,
)
from app.risk_engine import (
    classify_risk_level,
    compute_combined_risk_score,
    evaluate_risk_decision,
)


class TestRiskDecisionEngine(unittest.TestCase):
    """
    Exhaustive boundary and functional testing for the risk decision engine.
    """

    def test_exact_threshold_boundary_transitions(self):
        """
        Tests every exact boundary transition point:
        [0.0, 20.0) -> VERY_LOW
        [20.0, 40.0) -> LOW
        [40.0, 60.0) -> MODERATE
        [60.0, 80.0) -> HIGH
        [80.0, 100.0] -> EXTREME
        """
        thresholds = RiskThresholdConfig(
            very_low_max=20.0,
            low_max=40.0,
            moderate_max=60.0,
            high_max=80.0,
            extreme_max=100.0,
        )

        # 1. VERY_LOW Tier [0.0, 20.0)
        self.assertEqual(classify_risk_level(0.0, thresholds), RiskLevel.VERY_LOW)
        self.assertEqual(classify_risk_level(10.5, thresholds), RiskLevel.VERY_LOW)
        self.assertEqual(classify_risk_level(19.99, thresholds), RiskLevel.VERY_LOW)

        # 2. LOW Tier [20.0, 40.0)
        self.assertEqual(classify_risk_level(20.0, thresholds), RiskLevel.LOW)
        self.assertEqual(classify_risk_level(30.0, thresholds), RiskLevel.LOW)
        self.assertEqual(classify_risk_level(39.99, thresholds), RiskLevel.LOW)

        # 3. MODERATE Tier [40.0, 60.0)
        self.assertEqual(classify_risk_level(40.0, thresholds), RiskLevel.MODERATE)
        self.assertEqual(classify_risk_level(50.0, thresholds), RiskLevel.MODERATE)
        self.assertEqual(classify_risk_level(59.99, thresholds), RiskLevel.MODERATE)

        # 4. HIGH Tier [60.0, 80.0)
        self.assertEqual(classify_risk_level(60.0, thresholds), RiskLevel.HIGH)
        self.assertEqual(classify_risk_level(70.0, thresholds), RiskLevel.HIGH)
        self.assertEqual(classify_risk_level(79.99, thresholds), RiskLevel.HIGH)

        # 5. EXTREME Tier [80.0, 100.0]
        self.assertEqual(classify_risk_level(80.0, thresholds), RiskLevel.EXTREME)
        self.assertEqual(classify_risk_level(90.0, thresholds), RiskLevel.EXTREME)
        self.assertEqual(classify_risk_level(100.0, thresholds), RiskLevel.EXTREME)

    def test_custom_configurable_threshold_overrides(self):
        """
        Verify that threshold boundaries are fully configurable without hardcoding.
        """
        custom_thresholds = RiskThresholdConfig(
            very_low_max=15.0,
            low_max=35.0,
            moderate_max=55.0,
            high_max=75.0,
            extreme_max=100.0,
        )

        # 17.0 is LOW under custom (15.0 max), but VERY_LOW under default (20.0 max)
        self.assertEqual(classify_risk_level(17.0, custom_thresholds), RiskLevel.LOW)
        self.assertEqual(classify_risk_level(17.0, RiskThresholdConfig()), RiskLevel.VERY_LOW)

        # 76.0 is EXTREME under custom (75.0 max), but HIGH under default (80.0 max)
        self.assertEqual(classify_risk_level(76.0, custom_thresholds), RiskLevel.EXTREME)
        self.assertEqual(classify_risk_level(76.0, RiskThresholdConfig()), RiskLevel.HIGH)

    def test_configurable_multi_factor_weights(self):
        """
        Verify that weight configurations correctly modulate the combined score.
        """
        ts, mr, hr = 50.0, 70.0, 30.0

        # Default weights: 0.35*50 + 0.40*70 + 0.25*30 = 17.5 + 28.0 + 7.5 = 53.0
        default_score = compute_combined_risk_score(ts, mr, hr)
        self.assertEqual(default_score, 53.0)

        # Custom weights favoring mortality (0.10, 0.80, 0.10)
        # 0.10*50 + 0.80*70 + 0.10*30 = 5.0 + 56.0 + 3.0 = 64.0
        custom_weights = RiskWeightConfig(
            thermal_stress_weight=0.10,
            mortality_risk_weight=0.80,
            hospitalization_risk_weight=0.10,
        )
        custom_score = compute_combined_risk_score(ts, mr, hr, weights=custom_weights)
        self.assertEqual(custom_score, 64.0)

        # Invalid weights not summing to 1.0 must raise ValueError
        with self.assertRaises(ValueError):
            RiskWeightConfig(
                thermal_stress_weight=0.50,
                mortality_risk_weight=0.50,
                hospitalization_risk_weight=0.50,
            )

    def test_strict_input_validation_rejections(self):
        """
        Verify that NaN, Infinity, negative values, and values > 100 are rejected.
        """
        # Negative values
        with self.assertRaises(ValueError):
            evaluate_risk_decision(thermal_stress=-1.0, mortality_risk=50.0, hospitalization_risk=50.0)

        # Out of bounds (> 100)
        with self.assertRaises(ValueError):
            evaluate_risk_decision(thermal_stress=50.0, mortality_risk=105.0, hospitalization_risk=50.0)

        # NaN
        with self.assertRaises(ValueError):
            evaluate_risk_decision(thermal_stress=float("nan"), mortality_risk=50.0, hospitalization_risk=50.0)

        # Infinity
        with self.assertRaises(ValueError):
            evaluate_risk_decision(thermal_stress=50.0, mortality_risk=float("inf"), hospitalization_risk=50.0)

        # None
        with self.assertRaises(ValueError):
            evaluate_risk_decision(thermal_stress=None, mortality_risk=50.0, hospitalization_risk=50.0)

    def test_administrative_recommendations_per_tier(self):
        """
        Verify appropriate decision-support administrative action recommendations per tier:
        - VERY_LOW: Monitor conditions, standard public awareness
        - LOW: Enhanced monitoring, public awareness campaign, worker hydration
        - MODERATE: Cooling center readiness, healthcare preparedness, worker shift rescheduling
        - HIGH: Full cooling center deployment, emergency healthcare mobilization, outdoor work suspension
        - EXTREME: Emergency response escalation, total outdoor work halt, mass-casualty triage
        """
        # 1. VERY_LOW
        res_very_low = evaluate_risk_decision(thermal_stress=10.0, mortality_risk=5.0, hospitalization_risk=8.0)
        self.assertEqual(res_very_low.risk_level, "VERY_LOW")
        self.assertTrue(any("Monitor" in act for act in res_very_low.recommended_actions))
        self.assertTrue(any("Awareness" in act for act in res_very_low.recommended_actions))

        # 2. LOW
        res_low = evaluate_risk_decision(thermal_stress=30.0, mortality_risk=25.0, hospitalization_risk=20.0)
        self.assertEqual(res_low.risk_level, "LOW")
        self.assertTrue(any("Awareness" in act for act in res_low.recommended_actions))
        self.assertTrue(any("Worker" in act for act in res_low.recommended_actions))

        # 3. MODERATE
        res_mod = evaluate_risk_decision(thermal_stress=50.0, mortality_risk=52.0, hospitalization_risk=48.0)
        self.assertEqual(res_mod.risk_level, "MODERATE")
        self.assertTrue(any("Cooling" in act for act in res_mod.recommended_actions))
        self.assertTrue(any("Healthcare" in act for act in res_mod.recommended_actions))
        self.assertTrue(any("Worker" in act for act in res_mod.recommended_actions))

        # 4. HIGH
        res_high = evaluate_risk_decision(thermal_stress=72.0, mortality_risk=68.0, hospitalization_risk=75.0)
        self.assertEqual(res_high.risk_level, "HIGH")
        self.assertTrue(any("Cooling" in act for act in res_high.recommended_actions))
        self.assertTrue(any("Healthcare" in act for act in res_high.recommended_actions))
        self.assertTrue(any("Work" in act for act in res_high.recommended_actions))

        # 5. EXTREME
        res_extreme = evaluate_risk_decision(thermal_stress=88.0, mortality_risk=92.0, hospitalization_risk=85.0)
        self.assertEqual(res_extreme.risk_level, "EXTREME")
        self.assertTrue(any("Emergency Response" in act for act in res_extreme.recommended_actions))
        self.assertTrue(any("Prohibition" in act or "Halt" in act for act in res_extreme.recommended_actions))
        self.assertTrue(any("Triage" in act or "Casualty" in act for act in res_extreme.recommended_actions))

    def test_decision_support_disclaimer_presence(self):
        """
        Verify decision-support disclaimer is included and explicitly states it is not a medical diagnosis.
        """
        result = evaluate_risk_decision(thermal_stress=65.0, mortality_risk=60.0, hospitalization_risk=55.0)
        self.assertIn("disclaimer", result.to_dict())
        self.assertIn("decision-support", result.disclaimer.lower())
        self.assertIn("medical diagnosis", result.disclaimer.lower())
        self.assertEqual(result.disclaimer, DECISION_SUPPORT_DISCLAIMER)

    def test_strict_determinism_across_iterations(self):
        """
        Verify exact numerical and structural reproducibility across 100 evaluations.
        """
        ts, mr, hr = 62.4, 58.1, 71.9
        baseline = evaluate_risk_decision(ts, mr, hr).to_dict()

        for _ in range(100):
            current = evaluate_risk_decision(ts, mr, hr).to_dict()
            self.assertEqual(baseline, current)


if __name__ == "__main__":
    unittest.main()
