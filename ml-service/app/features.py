"""
Deterministic Thermodynamic & Biometeorological Feature Extraction
Connects to the standardized thermal feature engine (app/thermal.py) for physical calculations.
"""

from typing import Dict, Tuple
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


def transform_features(req: PredictionRequest) -> Tuple[Dict[str, float], EngineeredFeaturesOutput]:
    """
    Transforms raw incoming request into a comprehensive engineered feature vector.
    Uses app.thermal for verified thermodynamic formulas.
    """
    profile = compute_complete_thermal_profile(
        temperature_c=req.temperature,
        humidity_pct=req.humidity,
        wind_speed_ms=req.wind_speed,
        solar_radiation_w_m2=req.solar_radiation,
        surface_pressure_hpa=req.surface_pressure,
        dew_point_c=req.dew_point,
        consecutive_hot_days=req.consecutive_hot_days,
        is_urban=req.is_urban,
    )

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
    )

    feature_dict = {
        "temperature": req.temperature,
        "humidity": req.humidity,
        "wind_speed": req.wind_speed,
        "solar_radiation": req.solar_radiation,
        "surface_pressure": req.surface_pressure,
        "dew_point": profile.dew_point_c,
        "uv_index": req.uv_index,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "consecutive_hot_days": float(req.consecutive_hot_days),
        "is_urban": 1.0 if req.is_urban else 0.0,
        "population_density": float(req.population_density),
        "vapor_pressure": profile.vapor_pressure_hpa,
        "vapor_pressure_deficit": profile.vapor_pressure_deficit_hpa,
        "dew_point_depression": dew_point_depression,
        "enthalpy": profile.moist_air_enthalpy_kj_kg,
        "effective_solar": profile.effective_solar_heat_load_w_m2,
        "compound_stress": profile.compound_stress_multiplier,
        "uhi_offset": profile.uhi_offset_c,
        "hotspell_severity": profile.hotspell_severity_index,
        "heat_index": profile.heat_index_c,
        "wbgt": profile.wbgt_c,
        "wbgt_shade": profile.wbgt_shade_c,
        "utci": profile.utci_c,
        "cumulative_heat_exposure": profile.cumulative_heat_exposure_deg_days,
        "thermal_recovery_penalty": profile.thermal_recovery_penalty,
    }

    return feature_dict, engineered_output
