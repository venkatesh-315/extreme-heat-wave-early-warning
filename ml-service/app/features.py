"""
Deterministic Thermodynamic & Biometeorological Feature Extraction
Implements physical formulas for vapor pressure, moist air enthalpy, WBGT, UTCI, and compound heat indices.
"""

import math
from typing import Dict, Tuple
from .schemas import PredictionRequest, EngineeredFeaturesOutput


def calculate_dew_point(temperature: float, humidity: float) -> float:
    """Computes dew point (°C) via the Magnus-Tetens formula."""
    a = 17.27
    b = 237.7
    rh_safe = max(1.0, min(100.0, float(humidity)))
    alpha = ((a * temperature) / (b + temperature)) + math.log(rh_safe / 100.0)
    return round((b * alpha) / (a - alpha), 2)


def calculate_vapor_pressure(temperature: float, humidity: float) -> Tuple[float, float, float]:
    """
    Computes:
    - Saturation vapor pressure e_s (hPa)
    - Actual vapor pressure e (hPa)
    - Vapor pressure deficit VPD (hPa)
    """
    t = float(temperature)
    rh = max(1.0, min(100.0, float(humidity)))
    e_s = 6.1078 * math.exp((17.27 * t) / (237.3 + t))
    e = (rh / 100.0) * e_s
    vpd = max(0.0, e_s - e)
    return round(e_s, 2), round(e, 2), round(vpd, 2)


def calculate_moist_air_enthalpy(temperature: float, humidity: float, pressure_hpa: float = 1000.0) -> float:
    """
    Computes Specific Enthalpy of moist air in kJ/kg (total thermal energy per unit mass).
    h = 1.006 * T + w * (2501 + 1.86 * T)
    """
    t = float(temperature)
    _, e, _ = calculate_vapor_pressure(t, humidity)
    p = max(700.0, float(pressure_hpa))
    w = (0.622 * e) / max(10.0, (p - e))
    enthalpy = 1.006 * t + w * (2501.0 + 1.86 * t)
    return round(enthalpy, 2)


def calculate_heat_index(temperature: float, humidity: float) -> float:
    """NOAA Rothfusz regression equation for Heat Index (°C) with adjustments."""
    t = float(temperature)
    rh = max(1.0, min(100.0, float(humidity)))

    if t < 27.0:
        return round(t, 1)

    tf = t * 1.8 + 32.0
    hi_f = (
        -42.379
        + 2.04901523 * tf
        + 10.14333127 * rh
        - 0.22475541 * tf * rh
        - 0.00683783 * tf * tf
        - 0.05481717 * rh * rh
        + 0.00122874 * tf * tf * rh
        + 0.00085282 * tf * rh * rh
        - 0.00000199 * tf * tf * rh * rh
    )

    if rh < 13.0 and 80.0 <= tf <= 112.0:
        hi_f -= ((13.0 - rh) / 4.0) * math.sqrt(max(0.0, (17.0 - abs(tf - 95.0)) / 17.0))
    elif rh > 85.0 and 80.0 <= tf <= 87.0:
        hi_f += ((rh - 85.0) / 10.0) * ((87.0 - tf) / 5.0)

    hi_c = (hi_f - 32.0) * (5.0 / 9.0)
    return round(hi_c, 1)


def calculate_wbgt_approximation(
    temperature: float, humidity: float, wind_speed: float, solar_radiation: float
) -> float:
    """Stull Wet-Bulb + Globe Temperature Outdoor WBGT formula."""
    t = float(temperature)
    rh = max(1.0, min(100.0, float(humidity)))
    v = max(0.2, float(wind_speed))
    sr = max(0.0, float(solar_radiation))

    tw = (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )

    tg = t + 0.025 * sr - 0.8 * math.sqrt(max(0.3, v))
    wbgt = 0.7 * tw + 0.2 * tg + 0.1 * t
    return round(wbgt, 1)


def calculate_utci_approximation(
    temperature: float, humidity: float, wind_speed: float, solar_radiation: float
) -> float:
    """Universal Thermal Climate Index (UTCI) 6th-order approximation."""
    t = float(temperature)
    rh = max(1.0, min(100.0, float(humidity)))
    v = max(0.5, float(wind_speed))
    sr = max(0.0, float(solar_radiation))

    tmrt = t + 0.0014 * sr - 0.08 * math.sqrt(v)
    d_tmrt = tmrt - t
    pa = (rh / 100.0) * 6.105 * math.exp((17.27 * t) / (237.3 + t))

    utci = (
        t
        + 0.607562052
        - 0.0227712343 * t
        + 8.06470249e-4 * t * t
        - 1.54816591e-4 * t * t * t
        - 3.30261334e-4 * t * t * v
        + 1.16011335e-5 * t * t * v * v
        + d_tmrt * (0.0276021403 + 1.74491801e-4 * t - 1.23252154e-3 * v)
        + pa * (0.398374029 + 1.83945314e-4 * t * t - 1.73290961e-2 * v)
    )
    return round(utci, 1)


def transform_features(req: PredictionRequest) -> Tuple[Dict[str, float], EngineeredFeaturesOutput]:
    """
    Transforms raw input into a complete engineered biometeorological feature vector.
    """
    t = req.temperature
    rh = req.humidity
    w = req.wind_speed
    sr = req.solar_radiation
    p = req.surface_pressure

    dew_point = req.dew_point if req.dew_point is not None else calculate_dew_point(t, rh)
    _, e, vpd = calculate_vapor_pressure(t, rh)
    dew_point_depression = max(0.0, t - dew_point)
    enthalpy = calculate_moist_air_enthalpy(t, rh, p)

    # Convective wind attenuation of direct solar radiation
    effective_solar = round(sr * (1.0 - 0.08 * math.sqrt(max(0.4, w))), 2)

    # Non-linear compound heat-humidity multiplier
    compound_stress = round((t / 40.0) * math.pow(max(10.0, rh) / 40.0, 1.25), 3)

    # Urban Heat Island microclimate offset (+1.6°C)
    uhi_offset = 1.6 if req.is_urban else 0.0

    # Cumulative hotspell severity factor
    hotspell_severity = round(float(req.consecutive_hot_days) * max(0.0, t - 39.0), 2)

    hi = calculate_heat_index(t, rh)
    wbgt = calculate_wbgt_approximation(t, rh, w, sr)
    utci = calculate_utci_approximation(t, rh, w, sr)

    engineered_output = EngineeredFeaturesOutput(
        dew_point_c=dew_point,
        vapor_pressure_hpa=e,
        vapor_pressure_deficit_hpa=vpd,
        dew_point_depression_c=round(dew_point_depression, 2),
        moist_air_enthalpy_kj_kg=enthalpy,
        effective_solar_heat_load_w_m2=effective_solar,
        compound_stress_multiplier=compound_stress,
        cumulative_hotspell_severity=hotspell_severity,
        uhi_offset_c=uhi_offset,
    )

    feature_dict = {
        "temperature": t,
        "humidity": rh,
        "wind_speed": w,
        "solar_radiation": sr,
        "surface_pressure": p,
        "dew_point": dew_point,
        "uv_index": req.uv_index,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "consecutive_hot_days": float(req.consecutive_hot_days),
        "is_urban": 1.0 if req.is_urban else 0.0,
        "population_density": float(req.population_density),
        "vapor_pressure": e,
        "vapor_pressure_deficit": vpd,
        "dew_point_depression": dew_point_depression,
        "enthalpy": enthalpy,
        "effective_solar": effective_solar,
        "compound_stress": compound_stress,
        "uhi_offset": uhi_offset,
        "hotspell_severity": hotspell_severity,
        "heat_index": hi,
        "wbgt": wbgt,
        "utci": utci,
    }

    return feature_dict, engineered_output
