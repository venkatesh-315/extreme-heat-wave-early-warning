"""
Deterministic Heatwave Prediction Service
Combines rigorous thermodynamic feature engineering, versioned XGBoost ML inference,
and biometeorological human thermal stress modeling.
"""

from datetime import datetime, timezone
from typing import List, Tuple
import numpy as np

from .schemas import PredictionRequest, PredictionResponse, RiskFactor
from .features import transform_features, FEATURE_SCHEMA_VERSION
from .model import model_manager
from .risk_engine import evaluate_risk_decision


def calculate_compound_thermal_stress(wbgt: float, utci: float, heat_index: float, enthalpy: float) -> float:
    """
    Derives normalized compound human thermal stress index (0 - 100).
    Combines evaporative restriction (WBGT), radiant-convective balance (UTCI),
    and heat index psychrometrics.
    """
    # WBGT baseline: 20C (comfortable) to 36C (extreme heat stroke risk)
    wbgt_norm = float(np.clip((wbgt - 20.0) / 16.0 * 100.0, 0.0, 100.0))

    # UTCI baseline: 24C (no thermal stress) to 46C (extreme heat stress)
    utci_norm = float(np.clip((utci - 24.0) / 22.0 * 100.0, 0.0, 100.0))

    # Heat Index baseline: 26C (normal) to 54C (dangerous)
    hi_norm = float(np.clip((heat_index - 26.0) / 28.0 * 100.0, 0.0, 100.0))

    # Composite weighted thermal stress
    compound = 0.40 * wbgt_norm + 0.35 * utci_norm + 0.25 * hi_norm
    return round(float(np.clip(compound, 0.0, 100.0)), 1)


def determine_risk_level(thermal_stress: float, mortality_risk: float, hospitalization_risk: float) -> str:
    """
    Classifies combined physiological heat hazard into 5 standardized tiers:
    VERY_LOW | LOW | MODERATE | HIGH | EXTREME
    """
    max_risk = max(mortality_risk, hospitalization_risk, thermal_stress)

    if max_risk >= 70.0 or mortality_risk >= 65.0:
        return "EXTREME"
    if max_risk >= 50.0 or mortality_risk >= 45.0:
        return "HIGH"
    if max_risk >= 30.0 or mortality_risk >= 25.0:
        return "MODERATE"
    if max_risk >= 14.0 or mortality_risk >= 10.0:
        return "LOW"
    return "VERY_LOW"


def get_imd_alert(temperature: float, wbgt: float, latitude: float) -> Tuple[str, str]:
    """Classifies IMD 4-tier warning level with terrain threshold adjustments."""
    is_hills = latitude > 30.5
    threshold = 30.0 if is_hills else 40.0

    if wbgt >= 33.0 or temperature >= threshold + 5.5:
        return "RED", "RED_WARNING"
    if wbgt >= 30.0 or temperature >= threshold + 3.5:
        return "ORANGE", "ORANGE_ALERT"
    if wbgt >= 27.0 or temperature >= threshold:
        return "YELLOW", "YELLOW_WATCH"
    return "GREEN", "GREEN_NORMAL"


def get_risk_category(mortality_score: float) -> str:
    """Classifies risk level into human-readable category for legacy compatibility."""
    if mortality_score >= 65.0:
        return "Catastrophic"
    if mortality_score >= 45.0:
        return "Extreme"
    if mortality_score >= 28.0:
        return "High"
    if mortality_score >= 15.0:
        return "Moderate"
    return "Low"


def generate_risk_factors(req: PredictionRequest, wbgt: float, utci: float) -> List[RiskFactor]:
    """Generates explainable, deterministic risk driver contributions."""
    factors = []

    if req.temperature >= 43.0:
        factors.append(
            RiskFactor(
                feature="Extreme Ambient Temperature",
                weight=0.38,
                description=f"Dry-bulb temperature ({req.temperature}°C) significantly exceeds human physiological tolerance.",
            )
        )

    if wbgt >= 32.0:
        factors.append(
            RiskFactor(
                feature="Critical Wet-Bulb Globe Temperature",
                weight=0.34,
                description=f"High WBGT ({wbgt:.1f}°C) severely impedes evaporative cooling through sweat.",
            )
        )

    rh = float(req.humidity if req.humidity is not None else req.relative_humidity)
    if rh >= 50.0 and req.temperature >= 35.0:
        factors.append(
            RiskFactor(
                feature="Compound Humidity Stress",
                weight=0.25,
                description=f"Relative humidity at {rh}% creates oppressive compound thermal burden.",
            )
        )

    if req.consecutive_hot_days >= 3:
        factors.append(
            RiskFactor(
                feature="Prolonged Hotspell Duration",
                weight=0.18,
                description=f"{req.consecutive_hot_days} consecutive days of extreme heat causing cumulative fatigue.",
            )
        )

    if req.is_urban and req.population_density >= 10000:
        factors.append(
            RiskFactor(
                feature="Urban Heat Island & Density Factor",
                weight=0.15,
                description="Dense urban infrastructure and thermal retention elevate microclimate vulnerability.",
            )
        )

    if not factors:
        factors.append(
            RiskFactor(
                feature="Normal Baseline Meteorological State",
                weight=0.10,
                description="Observed parameters remain within climatological tolerance boundaries.",
            )
        )

    return factors[:4]


def predict_heatwave(req: PredictionRequest) -> PredictionResponse:
    """
    Executes end-to-end deterministic prediction pipeline.
    Always computes thermal stress features directly on the server to prevent trusting client values.
    """
    # 1. Server-Side Feature Engineering (pure physical thermodynamic calculations)
    features_dict, engineered_output = transform_features(req)

    wbgt = features_dict["wbgt"]
    utci = features_dict["utci"]
    heat_index = features_dict["heat_index"]
    temp = req.temperature
    enthalpy = engineered_output.moist_air_enthalpy_kj_kg

    # 2. Server-side Thermal Stress Index (0 - 100)
    thermal_stress = calculate_compound_thermal_stress(wbgt, utci, heat_index, enthalpy)

    # 3. Versioned XGBoost ML Inference with Safe Scientific Fallback
    ml_mortality_pred = model_manager.predict_mortality(features_dict)
    ml_hosp_pred = model_manager.predict_hospitalization(features_dict)

    active_version = "v1.0.0"
    if model_manager.metadata and "model_version" in model_manager.metadata:
        active_version = str(model_manager.metadata["model_version"])

    if ml_mortality_pred is not None and ml_hosp_pred is not None:
        mortality_risk = round(float(np.clip(ml_mortality_pred, 0.0, 100.0)), 1)
        # Hospitalization normalized percentage (0 - 100)
        hosp_risk = round(float(np.clip(ml_hosp_pred / 4.0, 0.0, 100.0)), 1)
        model_status = "xgboost_model"
        confidence = 0.98
    else:
        # Standardized Multi-Parametric Scientific Engine Fallback
        risk = 0.0
        if wbgt >= 35.0:
            risk += 65.0 + (wbgt - 35.0) * 8.0
        elif wbgt >= 32.0:
            risk += 45.0 + (wbgt - 32.0) * 6.5
        elif wbgt >= 30.0:
            risk += 28.0 + (wbgt - 30.0) * 8.5
        elif wbgt >= 28.0:
            risk += 14.0 + (wbgt - 28.0) * 7.0
        elif wbgt >= 26.0:
            risk += 5.0 + (wbgt - 26.0) * 4.5

        if temp >= 46.0:
            risk += 22.0
        elif temp >= 44.0:
            risk += 14.0
        elif temp >= 42.0:
            risk += 7.0

        if utci >= 46.0:
            risk += 10.0
        elif utci >= 38.0:
            risk += 5.0

        risk += min(18.0, req.consecutive_hot_days * 2.2)
        if req.is_urban and req.population_density > 12000:
            risk *= 1.06

        mortality_risk = round(float(np.clip(risk, 2.0, 99.0)), 1)
        hosp_risk = round(float(np.clip(mortality_risk * 1.15, 2.0, 99.0)), 1)
        model_status = "baseline_engine"
        confidence = 0.95
        active_version = "v1.0.0-fallback"

    # Physiological safety constraint for mild weather conditions
    if temp < 30.0 and wbgt < 25.0:
        mortality_risk = min(mortality_risk, 8.0)
        hosp_risk = min(hosp_risk, 10.0)
        thermal_stress = min(thermal_stress, 12.0)

    # 4. Evaluate Unified Risk Decision & Administrative Action Recommendations
    decision = evaluate_risk_decision(thermal_stress, mortality_risk, hosp_risk)
    risk_level = decision.risk_level
    combined_risk_score = decision.combined_risk_score
    recommended_actions = decision.recommended_actions

    # 5. IMD Warning & Categorical Helpers
    alert_level, alert_code = get_imd_alert(temp, wbgt, req.latitude)
    risk_cat = get_risk_category(mortality_risk)
    risk_factors = generate_risk_factors(req, wbgt, utci)
    timestamp_str = datetime.now(timezone.utc).isoformat()

    return PredictionResponse(
        model_version=active_version,
        thermal_stress=thermal_stress,
        mortality_risk=mortality_risk,
        hospitalization_risk=hosp_risk,
        risk_level=risk_level,
        prediction_timestamp=timestamp_str,
        feature_schema_version=FEATURE_SCHEMA_VERSION,
        combined_risk_score=combined_risk_score,
        recommended_actions=recommended_actions,
        # Legacy compatibility fields
        mortality_risk_score=mortality_risk,
        risk_category=risk_cat,
        predicted_wbgt=wbgt,
        predicted_utci=utci,
        heat_index=heat_index,
        alert_level=alert_level,
        alert_code=alert_code,
        confidence_score=confidence,
        model_status=model_status,
        top_risk_factors=risk_factors,
        engineered_features=engineered_output,
        timestamp=timestamp_str,
    )
