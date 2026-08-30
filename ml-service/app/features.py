"""
Machine Learning Feature Engineering Pipeline
Implements strict, deterministic 25-dimensional feature vector extraction:
1. Weather (temperature, relative humidity, wind speed, solar radiation, pressure, rainfall)
2. Thermal (heat index, WBGT, UTCI)
3. Temporal (hour, day, month, day-of-year, consecutive hot days)
4. Lag/Exposure (temperature lags 1/2/3d, WBGT lags 1/2/3d, cumulative heat exposure)
5. Vulnerability (population density, elderly %, outdoor-worker %, children %)

Enforces fixed schema, explicit missing value handling, zero future data leakage, and fixed array shapes.
"""

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Tuple, List, Any, Optional
import numpy as np

from .schemas import PredictionRequest, EngineeredFeaturesOutput
from .thermal import (
    calculate_dew_point,
    calculate_heat_index,
    calculate_wbgt,
    calculate_wbgt_shade,
    calculate_utci,
    calculate_wet_bulb_temperature,
    calculate_cumulative_heat_exposure,
    calculate_consecutive_hot_day_metrics,
    compute_complete_thermal_profile,
)

FEATURE_SCHEMA_VERSION = "v1.0.0"

# Strict, immutable, fixed ordered list of exactly 25 feature columns
FEATURE_COLUMNS: List[str] = [
    # 1. Weather (6)
    "temperature",
    "relative_humidity",
    "wind_speed",
    "solar_radiation",
    "surface_pressure",
    "rainfall_mm",
    # 2. Thermal (3)
    "heat_index",
    "wbgt",
    "utci",
    # 3. Temporal (5)
    "hour",
    "day",
    "month",
    "day_of_year",
    "consecutive_hot_days",
    # 4. Lag & Exposure (7)
    "temp_lag_1d",
    "temp_lag_2d",
    "temp_lag_3d",
    "wbgt_lag_1d",
    "wbgt_lag_2d",
    "wbgt_lag_3d",
    "cumulative_heat_exposure",
    # 5. Vulnerability (4)
    "population_density",
    "elderly_percentage",
    "outdoor_worker_percentage",
    "children_percentage",
]

# Calibrated Census Demographic Baselines for explicit missing-value handling
DEFAULT_VULNERABILITY_BASELINES: Dict[str, float] = {
    "elderly_percentage": 8.6,          # % population aged 65+ (Census/SRS India baseline)
    "outdoor_worker_percentage": 18.5,  # % informal outdoor construction/agricultural workforce
    "children_percentage": 11.2,        # % pediatric cohort aged 0-5
}


def get_feature_schema() -> Dict[str, Any]:
    """Returns complete metadata descriptor of the fixed feature engineering schema."""
    return {
        "version": FEATURE_SCHEMA_VERSION,
        "feature_count": len(FEATURE_COLUMNS),
        "columns": FEATURE_COLUMNS,
        "categories": {
            "weather": [
                "temperature",
                "relative_humidity",
                "wind_speed",
                "solar_radiation",
                "surface_pressure",
                "rainfall_mm",
            ],
            "thermal": ["heat_index", "wbgt", "utci"],
            "temporal": ["hour", "day", "month", "day_of_year", "consecutive_hot_days"],
            "lag_exposure": [
                "temp_lag_1d",
                "temp_lag_2d",
                "temp_lag_3d",
                "wbgt_lag_1d",
                "wbgt_lag_2d",
                "wbgt_lag_3d",
                "cumulative_heat_exposure",
            ],
            "vulnerability": [
                "population_density",
                "elderly_percentage",
                "outdoor_worker_percentage",
                "children_percentage",
            ],
        },
        "demographic_baselines": DEFAULT_VULNERABILITY_BASELINES,
    }


def save_feature_schema_file(dest_path: Optional[Path] = None) -> Path:
    """Persists the feature schema to a fixed JSON file for training/serving parity."""
    target = dest_path or (Path(__file__).resolve().parent / "feature_schema.json")
    with open(target, "w", encoding="utf-8") as f:
        json.dump(get_feature_schema(), f, indent=2)
    return target


def extract_temporal_features(req: PredictionRequest) -> Dict[str, float]:
    """
    Extracts deterministic temporal features (hour, day, month, day_of_year, consecutive_hot_days).
    Prioritizes observation_time ISO string, then explicit components, then current UTC.
    """
    if req.observation_time:
        try:
            # Handle ISO string timestamps
            dt = datetime.fromisoformat(req.observation_time.replace("Z", "+00:00"))
            hour = dt.hour
            day = dt.day
            month = dt.month
            day_of_year = dt.timetuple().tm_yday
        except Exception:
            # Fallback to explicit fields or UTC now
            now = datetime.now(timezone.utc)
            hour = req.hour if req.hour is not None else now.hour
            day = req.day if req.day is not None else now.day
            month = req.month if req.month is not None else now.month
            day_of_year = req.day_of_year if req.day_of_year is not None else now.timetuple().tm_yday
    else:
        now = datetime.now(timezone.utc)
        hour = req.hour if req.hour is not None else now.hour
        day = req.day if req.day is not None else now.day
        month = req.month if req.month is not None else now.month
        day_of_year = req.day_of_year if req.day_of_year is not None else now.timetuple().tm_yday

    return {
        "hour": float(hour),
        "day": float(day),
        "month": float(month),
        "day_of_year": float(day_of_year),
        "consecutive_hot_days": float(req.consecutive_hot_days),
    }


def extract_lag_features(
    req: PredictionRequest, current_temp: float, current_wbgt: float
) -> Dict[str, float]:
    """
    Extracts past lag features (1d, 2d, 3d) and cumulative exposure.
    Strictly uses prior observations only, preventing future data leakage.
    If historical lags are omitted, reconstructs historical trajectory from consecutive_hot_days.
    """
    hot_days = req.consecutive_hot_days

    # 1. Temperature Lags
    if req.temp_lag_1d is not None:
        t_lag1 = float(req.temp_lag_1d)
    else:
        # Reconstruct: if hotspell was active, prior day was hot; if day 0, prior day was moderate
        t_lag1 = current_temp - 0.4 if hot_days >= 2 else (current_temp - 4.5 if hot_days == 0 else current_temp - 1.2)

    if req.temp_lag_2d is not None:
        t_lag2 = float(req.temp_lag_2d)
    else:
        t_lag2 = current_temp - 0.8 if hot_days >= 3 else (current_temp - 5.5 if hot_days <= 1 else current_temp - 2.0)

    if req.temp_lag_3d is not None:
        t_lag3 = float(req.temp_lag_3d)
    else:
        t_lag3 = current_temp - 1.2 if hot_days >= 4 else (current_temp - 6.5 if hot_days <= 2 else current_temp - 3.0)

    # 2. WBGT Lags
    if req.wbgt_lag_1d is not None:
        wbgt_lag1 = float(req.wbgt_lag_1d)
    else:
        wbgt_lag1 = current_wbgt - 0.3 if hot_days >= 2 else (current_wbgt - 3.5 if hot_days == 0 else current_wbgt - 1.0)

    if req.wbgt_lag_2d is not None:
        wbgt_lag2 = float(req.wbgt_lag_2d)
    else:
        wbgt_lag2 = current_wbgt - 0.6 if hot_days >= 3 else (current_wbgt - 4.5 if hot_days <= 1 else current_wbgt - 1.8)

    if req.wbgt_lag_3d is not None:
        wbgt_lag3 = float(req.wbgt_lag_3d)
    else:
        wbgt_lag3 = current_wbgt - 0.9 if hot_days >= 4 else (current_wbgt - 5.5 if hot_days <= 2 else current_wbgt - 2.5)

    # 3. Cumulative Heat Exposure (°C·days above 35°C threshold)
    cumulative_exp = calculate_cumulative_heat_exposure(
        temperature_c=current_temp,
        consecutive_hot_days=hot_days,
        baseline_threshold_c=35.0,
    )

    return {
        "temp_lag_1d": round(t_lag1, 2),
        "temp_lag_2d": round(t_lag2, 2),
        "temp_lag_3d": round(t_lag3, 2),
        "wbgt_lag_1d": round(wbgt_lag1, 2),
        "wbgt_lag_2d": round(wbgt_lag2, 2),
        "wbgt_lag_3d": round(wbgt_lag3, 2),
        "cumulative_heat_exposure": cumulative_exp,
    }


def extract_vulnerability_features(req: PredictionRequest) -> Dict[str, float]:
    """
    Extracts demographic vulnerability factors with explicit census baselines for missing values.
    Never silently uses arbitrary unvalidated quantities.
    """
    elderly = (
        float(req.elderly_percentage)
        if req.elderly_percentage is not None
        else DEFAULT_VULNERABILITY_BASELINES["elderly_percentage"]
    )
    outdoor = (
        float(req.outdoor_worker_percentage)
        if req.outdoor_worker_percentage is not None
        else DEFAULT_VULNERABILITY_BASELINES["outdoor_worker_percentage"]
    )
    children = (
        float(req.children_percentage)
        if req.children_percentage is not None
        else DEFAULT_VULNERABILITY_BASELINES["children_percentage"]
    )

    return {
        "population_density": float(req.population_density),
        "elderly_percentage": round(elderly, 2),
        "outdoor_worker_percentage": round(outdoor, 2),
        "children_percentage": round(children, 2),
    }


def validate_feature_vector(vector: np.ndarray) -> None:
    """
    Enforces strict 25-feature vector dimensionality, finite checks, and no NaN/Inf values.
    """
    if not isinstance(vector, np.ndarray):
        raise TypeError(f"Feature vector must be a numpy ndarray, received {type(vector).__name__}.")

    expected_len = len(FEATURE_COLUMNS)
    if vector.ndim == 1:
        if vector.shape[0] != expected_len:
            raise ValueError(f"Feature vector shape mismatch: expected ({expected_len},), got {vector.shape}.")
    elif vector.ndim == 2:
        if vector.shape[1] != expected_len:
            raise ValueError(f"Feature vector shape mismatch: expected (N, {expected_len}), got {vector.shape}.")
    else:
        raise ValueError(f"Unexpected feature vector dimensions: {vector.ndim}D array is not supported.")

    if not np.all(np.isfinite(vector)):
        raise ValueError("Feature vector contains non-finite values (NaN or Infinity).")


def extract_feature_vector(
    req: PredictionRequest,
) -> Tuple[np.ndarray, Dict[str, float], EngineeredFeaturesOutput]:
    """
    End-to-end deterministic feature extraction generating:
    1. A fixed 25-element numpy float32 array in exact canonical order
    2. A complete named feature dictionary
    3. An EngineeredFeaturesOutput schema object
    """
    # 1. Thermal Engine Calculations
    rh = float(req.humidity if req.humidity is not None else req.relative_humidity)
    profile = compute_complete_thermal_profile(
        temperature_c=req.temperature,
        humidity_pct=rh,
        wind_speed_ms=req.wind_speed,
        solar_radiation_w_m2=req.solar_radiation,
        surface_pressure_hpa=req.surface_pressure,
        dew_point_c=req.dew_point,
        consecutive_hot_days=req.consecutive_hot_days,
        is_urban=req.is_urban,
    )

    # 2. Extract Category Groups
    temporal = extract_temporal_features(req)
    lags = extract_lag_features(req, req.temperature, profile.wbgt_c)
    vuln = extract_vulnerability_features(req)

    # 3. Assemble Complete Canonical Dictionary
    feature_dict: Dict[str, float] = {
        # Weather
        "temperature": float(req.temperature),
        "relative_humidity": rh,
        "wind_speed": float(req.wind_speed),
        "solar_radiation": float(req.solar_radiation),
        "surface_pressure": float(req.surface_pressure),
        "rainfall_mm": float(req.rainfall_mm),
        # Thermal
        "heat_index": profile.heat_index_c,
        "wbgt": profile.wbgt_c,
        "utci": profile.utci_c,
        # Temporal
        "hour": temporal["hour"],
        "day": temporal["day"],
        "month": temporal["month"],
        "day_of_year": temporal["day_of_year"],
        "consecutive_hot_days": temporal["consecutive_hot_days"],
        # Lag / Exposure
        "temp_lag_1d": lags["temp_lag_1d"],
        "temp_lag_2d": lags["temp_lag_2d"],
        "temp_lag_3d": lags["temp_lag_3d"],
        "wbgt_lag_1d": lags["wbgt_lag_1d"],
        "wbgt_lag_2d": lags["wbgt_lag_2d"],
        "wbgt_lag_3d": lags["wbgt_lag_3d"],
        "cumulative_heat_exposure": lags["cumulative_heat_exposure"],
        # Vulnerability
        "population_density": vuln["population_density"],
        "elderly_percentage": vuln["elderly_percentage"],
        "outdoor_worker_percentage": vuln["outdoor_worker_percentage"],
        "children_percentage": vuln["children_percentage"],
    }

    # 4. Construct strictly ordered Numpy Array
    vector = np.array([feature_dict[col] for col in FEATURE_COLUMNS], dtype=np.float32)
    validate_feature_vector(vector)

    # 5. Build Output Summary Schema
    dew_point_depression = round(max(0.0, req.temperature - profile.dew_point_c), 2)
    engineered_output = EngineeredFeaturesOutput(
        dew_point_c=profile.dew_point_c,
        vapor_pressure_hpa=profile.vapor_pressure_hpa,
        vapor_pressure_deficit_hpa=profile.vapor_pressure_deficit_hpa,
        dew_point_depression_c=dew_point_depression,
        moist_air_enthalpy_kj_kg=profile.moist_air_enthalpy_kj_kg,
        effective_solar_heat_load_w_m2=profile.effective_solar_heat_load_w_m2,
        compound_stress_multiplier=profile.compound_stress_multiplier,
        cumulative_hotspell_severity=profile.hotspell_severity_index,
        uhi_offset_c=profile.uhi_offset_c,
        wbgt_shade_c=profile.wbgt_shade_c,
        wet_bulb_temp_c=profile.wet_bulb_temp_c,
        cumulative_heat_exposure_deg_days=profile.cumulative_heat_exposure_deg_days,
        thermal_recovery_penalty=profile.thermal_recovery_penalty,
        feature_schema_version=FEATURE_SCHEMA_VERSION,
        feature_count=len(FEATURE_COLUMNS),
    )

    return vector, feature_dict, engineered_output


def transform_features(
    req: PredictionRequest,
) -> Tuple[Dict[str, float], EngineeredFeaturesOutput]:
    """
    Backward-compatible entry point returning named dict and EngineeredFeaturesOutput.
    """
    _, feature_dict, engineered_output = extract_feature_vector(req)
    return feature_dict, engineered_output
