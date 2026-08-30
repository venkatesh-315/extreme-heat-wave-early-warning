"""
Thermodynamic & Biometeorological Feature Engineering Pipeline
Standardized for Indian Climatology, IMD Guidelines & NDMA Heat Action Protocols
"""

import math
from typing import Dict, Any
from .schemas import HeatwavePredictionRequest, EngineeredFeaturesSummary


def calculate_dew_point(temperature: float, humidity: float) -> float:
    """Magnus-Tetens Dew Point calculation."""
    a = 17.27
    b = 237.7
    rh_safe = max(1.0, min(100.0, float(humidity)))
    alpha = ((a * temperature) / (b + temperature)) + math.log(rh_safe / 100.0)
    return round((b * alpha) / (a - alpha), 2)


def calculate_vapor_pressure(temperature: float, humidity: float) -> tuple[float, float, float]:
    """
    Computes:
    - Saturation Vapor Pressure e_s (hPa)
    - Actual Vapor Pressure e (hPa)
    - Vapor Pressure Deficit VPD (hPa)
    """
    e_s = 6.1078 * math.exp((17.27 * temperature) / (237.3 + temperature))
    e = (max(1.0, min(100.0, humidity)) / 100.0) * e_s
    vpd = max(0.0, e_s - e)
    return round(e_s, 2), round(e, 2), round(vpd, 2)


def calculate_moist_air_enthalpy(temperature: float, humidity: float, pressure_hpa: float = 1000.0) -> float:
    """
    Computes Specific Enthalpy of moist air in kJ/kg (heat content per unit mass).
    h = 1.006 * T + w * (2501 + 1.86 * T)
    where w is humidity mixing ratio (kg water / kg dry air).
    """
    _, e, _ = calculate_vapor_pressure(temperature, humidity)
    p = max(800.0, pressure_hpa)
    # Mixing ratio w ≈ 0.622 * e / (p - e) in kg/kg
    w = (0.622 * e) / max(10.0, (p - e))
    enthalpy = 1.006 * temperature + w * (2501.0 + 1.86 * temperature)
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


def calculate_wbgt_approximation(temperature: float, humidity: float, wind_speed: float, solar_radiation: float) -> float:
    """Stull Wet-Bulb + Globe Temperature Outdoor WBGT formula."""
    t = float(temperature)
    rh = max(1.0, min(100.0, float(humidity)))
    v = max(0.2, float(wind_speed))
    sr = max(0.0, float(solar_radiation))

    # Stull wet-bulb formula
    tw = (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )

    # Globe temperature approximation
    tg = t + 0.025 * sr - 0.8 * math.sqrt(max(0.3, v))

    # Outdoor WBGT = 0.7*Tw + 0.2*Tg + 0.1*T
    wbgt = 0.7 * tw + 0.2 * tg + 0.1 * t
    return round(wbgt, 1)


def calculate_utci_approximation(temperature: float, humidity: float, wind_speed: float, solar_radiation: float) -> float:
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


def extract_features(req: HeatwavePredictionRequest) -> tuple[Dict[str, float], EngineeredFeaturesSummary]:
    """
    Transforms raw incoming request into full engineered feature vector ready for XGBoost model input.
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

    # Effective solar heat load attenuated by convective wind cooling
    effective_solar = round(sr * (1.0 - 0.08 * math.sqrt(max(0.4, w))), 2)

    # Compound Heat-Humidity Stress Multiplier
    compound_stress = round((t / 40.0) * math.pow(max(10.0, rh) / 40.0, 1.25), 3)

    # Urban Heat Island (UHI) offset (+1.6°C for dense urban centers)
    uhi_offset = 1.6 if req.is_urban else 0.0

    # Cumulative hotspell severity factor
    hotspell_severity = round(float(req.consecutive_hot_days) * max(0.0, t - 39.0), 2)

    # Base Heat Index, WBGT, UTCI
    hi = calculate_heat_index(t, rh)
    wbgt_approx = calculate_wbgt_approximation(t, rh, w, sr)
    utci_approx = calculate_utci_approximation(t, rh, w, sr)

    engineered_summary = EngineeredFeaturesSummary(
        dew_point_c=dew_point,
        vapor_pressure_hpa=e,
        vapor_pressure_deficit_hpa=vpd,
        dew_point_depression_c=round(dew_point_depression, 2),
        enthalpy_kj_kg=enthalpy,
        effective_solar_heat_load=effective_solar,
        compound_stress_multiplier=compound_stress,
        cumulative_hotspell_severity=hotspell_severity,
        uhi_temperature_offset_c=uhi_offset
    )

    # Feature vector dictionary for ML input
    feature_dict = {
        "temperature": t,
        "humidity": rh,
        "wind_speed": w,
        "solar_radiation": sr,
        "surface_pressure": p,
        "dew_point": dew_point,
        "uv_index": req.uv_index,
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
        "heat_index_base": hi,
        "wbgt_base": wbgt_approx,
        "utci_base": utci_approx,
    }

    return feature_dict, engineered_summary
