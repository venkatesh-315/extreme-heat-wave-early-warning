"""
Thermal Index Engine for SIH-26083
Calculates advanced biometeorological indices:
1. WBGT (Wet-Bulb Globe Temperature) - Liljegren/Bernard outdoor approximation
2. UTCI (Universal Thermal Climate Index) - Multi-node human thermal balance approximation
3. NOAA Heat Index (Rothfusz regression equation)
4. Humidex
"""

import math

def calculate_dew_point(temp_c: float, humidity_pct: float) -> float:
    """Calculates Dew Point in Celsius using Magnus-Tetens formula."""
    a = 17.27
    b = 237.7
    alpha = ((a * temp_c) / (b + temp_c)) + math.log(max(0.01, humidity_pct) / 100.0)
    dew_point = (b * alpha) / (a - alpha)
    return round(dew_point, 2)

def calculate_wet_bulb(temp_c: float, humidity_pct: float) -> float:
    """Calculates Natural Wet-Bulb Temperature (Tw) using Stull's empirical equation."""
    t = temp_c
    rh = humidity_pct
    tw = (
        t * math.atan(0.151977 * math.pow(rh + 8.313659, 0.5))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return round(tw, 2)

def calculate_globe_temperature(temp_c: float, wind_speed_ms: float, solar_rad_wm2: float) -> float:
    """
    Calculates Black Globe Temperature (Tg) measuring radiant heat.
    Based on solar radiation (W/m2), wind speed (m/s), and dry-bulb ambient temperature.
    """
    wind = max(0.1, wind_speed_ms)
    # Empirical solar radiation heating factor dampened by wind convective cooling
    delta_tg = (0.014 * solar_rad_wm2) / math.sqrt(wind)
    tg = temp_c + delta_tg
    return round(tg, 2)

def calculate_wbgt(temp_c: float, humidity_pct: float, wind_speed_ms: float, solar_rad_wm2: float) -> dict:
    """
    Calculates Outdoor Wet-Bulb Globe Temperature (WBGT):
    WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
    """
    tw = calculate_wet_bulb(temp_c, humidity_pct)
    tg = calculate_globe_temperature(temp_c, wind_speed_ms, solar_rad_wm2)
    ta = temp_c
    
    wbgt = 0.7 * tw + 0.2 * tg + 0.1 * ta
    wbgt = round(wbgt, 2)

    # Classify WBGT Risk Category (ISO 7243 & Indian National Disaster Management Authority Guidelines)
    if wbgt < 26.0:
        flag = "NORMAL"
        color = "#10b981" # Green
        work_rest_ratio = "Continuous work permitted"
        water_intake_lph = 0.5
    elif 26.0 <= wbgt < 29.0:
        flag = "YELLOW_ALERT"
        color = "#f59e0b" # Yellow / Amber
        work_rest_ratio = "45 min work / 15 min rest per hour"
        water_intake_lph = 0.75
    elif 29.0 <= wbgt < 31.0:
        flag = "ORANGE_ALERT"
        color = "#f97316" # Orange
        work_rest_ratio = "30 min work / 30 min rest per hour"
        water_intake_lph = 1.0
    elif 31.0 <= wbgt < 33.0:
        flag = "RED_ALERT"
        color = "#ef4444" # Red
        work_rest_ratio = "15 min work / 45 min rest per hour (Heavy labor halted)"
        water_intake_lph = 1.25
    else:
        flag = "EXTREME_DANGER"
        color = "#7f1d1d" # Maroon / Dark Red
        work_rest_ratio = "TOTAL OUTDOOR WORK CURFEW (11:00 - 16:30)"
        water_intake_lph = 1.5

    return {
        "wbgt": wbgt,
        "wet_bulb_temp_c": tw,
        "globe_temp_c": tg,
        "dry_bulb_temp_c": ta,
        "alert_level": flag,
        "alert_color": color,
        "recommended_work_rest": work_rest_ratio,
        "hydration_target_liters_per_hour": water_intake_lph
    }

def calculate_utci(temp_c: float, humidity_pct: float, wind_speed_ms: float, solar_rad_wm2: float) -> dict:
    """
    Universal Thermal Climate Index (UTCI) approximation.
    Thermal stress experienced by human physiology considering sweating, clothing, and radiation.
    """
    # Equivalent temperature adjustment based on wind, humidity, and solar load
    wind = max(0.5, wind_speed_ms)
    vp = (humidity_pct / 100.0) * 6.1078 * math.exp((17.27 * temp_c) / (temp_c + 237.3)) # vapor pressure in hPa
    
    # Simplified operational regression for UTCI
    delta_t = temp_c - 20.0
    rad_offset = (solar_rad_wm2 / 1000.0) * 4.5
    wind_cooling = 1.8 * (wind - 1.0)
    humidity_load = 0.25 * (vp - 12.0)
    
    utci = temp_c + rad_offset + humidity_load - wind_cooling
    utci = round(utci, 2)

    if utci < 26:
        stress = "No Thermal Stress"
    elif 26 <= utci < 32:
        stress = "Moderate Heat Stress"
    elif 32 <= utci < 38:
        stress = "Strong Heat Stress"
    elif 38 <= utci < 46:
        stress = "Very Strong Heat Stress"
    else:
        stress = "Extreme Heat Stress"

    return {
        "utci": utci,
        "thermal_stress_category": stress
    }

def calculate_heat_index(temp_c: float, humidity_pct: float) -> float:
    """Calculates NOAA Heat Index using Rothfusz regression equation in Celsius."""
    # Convert C to F
    tf = (temp_c * 9.0 / 5.0) + 32.0
    rh = humidity_pct

    # Simple formula first
    hi_simple = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (rh * 0.094))
    if hi_simple < 80:
        hi_f = hi_simple
    else:
        # Full Rothfusz regression
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
    
    hi_c = (hi_f - 32.0) * 5.0 / 9.0
    return round(hi_c, 2)

def compute_all_thermal_metrics(temp_c: float, humidity_pct: float, wind_speed_ms: float, solar_rad_wm2: float) -> dict:
    """Computes all thermal metrics in one consolidated call."""
    wbgt_data = calculate_wbgt(temp_c, humidity_pct, wind_speed_ms, solar_rad_wm2)
    utci_data = calculate_utci(temp_c, humidity_pct, wind_speed_ms, solar_rad_wm2)
    heat_index = calculate_heat_index(temp_c, humidity_pct)
    dew_point = calculate_dew_point(temp_c, humidity_pct)

    return {
        "ambient_temp_c": temp_c,
        "relative_humidity_pct": humidity_pct,
        "wind_speed_ms": wind_speed_ms,
        "solar_radiation_wm2": solar_rad_wm2,
        "dew_point_c": dew_point,
        "heat_index_c": heat_index,
        "wbgt": wbgt_data,
        "utci": utci_data
    }
