"""
Deterministic Heatwave Prediction Service
Combines thermodynamic feature engineering, optional ML inference, and scientific biometeorological modeling.
"""

from datetime import datetime, timezone
from typing import List
from .schemas import PredictionRequest, PredictionResponse, RiskFactor
from .features import transform_features
from .model import model_manager


def get_imd_alert(temperature: float, wbgt: float, latitude: float) -> tuple[str, str]:
    """
    Classifies IMD 4-tier warning level with terrain threshold adjustments.
    """
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
    """Classifies risk level into standardized human-readable category."""
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
    """
    Generates explainable, deterministic risk driver contributions.
    """
    factors = []

    if req.temperature >= 43.0:
        factors.append(
            RiskFactor(
                feature="Extreme Ambient Temperature",
                weight=0.38,
                description=f"Dry-bulb temperature ({req.temperature}°C) significantly exceeds human physiological threshold.",
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
                description=f"Relative humidity at {rh}% creates oppressive compound heat burden.",
            )
        )

    if req.consecutive_hot_days >= 3:
        factors.append(
            RiskFactor(
                feature="Prolonged Hotspell Duration",
                weight=0.18,
                description=f"{req.consecutive_hot_days} consecutive days of extreme heat causing cumulative physiological fatigue.",
            )
        )

    if req.is_urban and req.population_density >= 10000:
        factors.append(
            RiskFactor(
                feature="Urban Heat Island & Density Factor",
                weight=0.15,
                description="Dense urban infrastructure and thermal retention elevate vulnerability.",
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
    """
    # 1. Feature Engineering
    features_dict, engineered_output = transform_features(req)

    wbgt = features_dict["wbgt"]
    utci = features_dict["utci"]
    heat_index = features_dict["heat_index"]
    temp = req.temperature

    # 2. ML Inference or Deterministic Scientific Engine
    ml_mortality_pred = model_manager.predict(features_dict)

    if ml_mortality_pred is not None:
        mortality_risk_score = round(max(3.0, min(99.0, ml_mortality_pred)), 1)
        model_status = "xgboost_model"
        confidence = 0.98
    else:
        # Standardized NDMA/IMD Multi-Parametric Scientific Engine
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

        # Cumulative hot days impact
        risk += min(18.0, req.consecutive_hot_days * 2.2)

        # Urban density impact
        if req.is_urban and req.population_density > 12000:
            risk *= 1.06

        mortality_risk_score = round(max(3.0, min(99.0, risk)), 1)
        model_status = "baseline_engine"
        confidence = 0.95

    # 3. IMD Warning & Category
    alert_level, alert_code = get_imd_alert(temp, wbgt, req.latitude)
    risk_cat = get_risk_category(mortality_risk_score)
    risk_factors = generate_risk_factors(req, wbgt, utci)

    return PredictionResponse(
        mortality_risk_score=mortality_risk_score,
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
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
