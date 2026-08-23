"""
Predictive Mortality & Heat Vulnerability Index (HVI) Engine
SIH-26083: Extreme Heatwave Early Warning & Human Thermal Stress Index

Integrates:
- Multi-factor Heat Vulnerability Index (HVI)
- 3 to 5 Day Predictive Excess Mortality & Hospital Surge Model
- Automated Municipal Heat Action Plan (HAP) Generator
- What-If Mitigation Simulator
"""

import math
from typing import Dict, Any, List

def calculate_hvi(demographics: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes normalized Heat Vulnerability Index (HVI) [0.0 - 1.0].
    
    Factors:
    - elderly_pct: Population > 65 yrs (Weight: 0.25)
    - outdoor_worker_pct: Daily wage, construction, street vendors (Weight: 0.25)
    - slum_density_pct: Tin/asbestos roofs, poor ventilation (Weight: 0.25)
    - green_cover_pct: Tree canopy & NDVI (Weight: -0.15) [Protective factor]
    - hospital_distance_km: Distance to nearest tertiary care/ICU (Weight: 0.10)
    """
    elderly = demographics.get("elderly_pct", 10.0) / 100.0
    workers = demographics.get("outdoor_worker_pct", 25.0) / 100.0
    slums = demographics.get("slum_density_pct", 20.0) / 100.0
    green = demographics.get("green_cover_pct", 15.0) / 100.0
    dist_km = min(10.0, demographics.get("hospital_distance_km", 2.5)) / 10.0

    raw_score = (
        0.25 * (elderly / 0.20) +          # normalized up to 20% elderly
        0.25 * (workers / 0.50) +          # normalized up to 50% workers
        0.25 * (slums / 0.60) +            # normalized up to 60% slums
        0.10 * dist_km -                   # distance to hospital
        0.15 * (green / 0.40)              # vegetation protection
    )

    # Clamp between 0.05 and 0.98
    hvi = max(0.05, min(0.98, raw_score))
    hvi = round(hvi, 3)

    if hvi < 0.30:
        hvi_tier = "LOW"
    elif 0.30 <= hvi < 0.60:
        hvi_tier = "MODERATE"
    elif 0.60 <= hvi < 0.80:
        hvi_tier = "HIGH"
    else:
        hvi_tier = "CRITICAL"

    return {
        "hvi_score": hvi,
        "vulnerability_tier": hvi_tier,
        "breakdown": {
            "elderly_risk": round(elderly * 100, 1),
            "outdoor_worker_risk": round(workers * 100, 1),
            "slum_heat_trap_risk": round(slums * 100, 1),
            "green_canopy_pct": round(green * 100, 1),
            "hospital_distance_km": round(dist_km * 10, 1)
        }
    }

def predict_mortality_and_hospital_surge(wbgt_val: float, hvi_score: float, baseline_population: int = 150000) -> Dict[str, Any]:
    """
    Predicts Excess Mortality Rate and Hospitalization Admissions Spike
    using an epidemiologically validated Relative Risk (RR) exponential response curve.
    Baseline reference: WBGT threshold = 28.0 C.
    """
    wbgt_threshold = 28.0
    beta_mortality = 0.12 # coefficient for excess mortality per deg WBGT over threshold
    beta_hospital = 0.18  # coefficient for hospitalization admissions spike

    if wbgt_val > wbgt_threshold:
        excess_temp = wbgt_val - wbgt_threshold
        # Exponential Relative Risk compounded by ward vulnerability
        rr_mortality = math.exp(beta_mortality * excess_temp * (1.0 + hvi_score))
        rr_hospital = math.exp(beta_hospital * excess_temp * (1.0 + hvi_score))
    else:
        rr_mortality = 1.0
        rr_hospital = 1.0

    # Predicted percentage surges
    excess_mortality_pct = round((rr_mortality - 1.0) * 100, 1)
    hospital_surge_pct = round((rr_hospital - 1.0) * 100, 1)

    # Absolute estimated counts for the ward
    daily_baseline_deaths = (baseline_population * 0.007) / 365.0 # standard crude mortality baseline
    daily_baseline_admissions = (baseline_population * 0.05) / 365.0

    est_excess_deaths_daily = max(0, round(daily_baseline_deaths * (rr_mortality - 1.0)))
    est_excess_admissions_daily = max(0, round(daily_baseline_admissions * (rr_hospital - 1.0)))

    # Mortality Risk Index (0 - 100 scale)
    mri_score = min(100, round((excess_mortality_pct * 0.6) + (hvi_score * 40)))

    if mri_score < 25:
        risk_level = "GREEN - SAFE"
        risk_color = "#10b981"
    elif 25 <= mri_score < 50:
        risk_level = "YELLOW - MODERATE RISK"
        risk_color = "#f59e0b"
    elif 50 <= mri_score < 75:
        risk_level = "ORANGE - HIGH HEALTH SURGE"
        risk_color = "#f97316"
    else:
        risk_level = "RED - SEVERE MORTALITY RISK"
        risk_color = "#ef4444"

    return {
        "mortality_risk_index": mri_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "relative_risk_ratio": round(rr_mortality, 2),
        "excess_mortality_surge_pct": excess_mortality_pct,
        "hospital_admission_surge_pct": hospital_surge_pct,
        "estimated_excess_daily_hospitalizations": est_excess_admissions_daily,
        "estimated_excess_daily_mortality": est_excess_deaths_daily,
        "population_at_risk": int(baseline_population * hvi_score)
    }

def generate_automated_heat_action_plan(wbgt_data: Dict[str, Any], mortality_data: Dict[str, Any], ward_name: str) -> Dict[str, Any]:
    """
    Generates actionable, automated Heat Action Plan (HAP) directives
    for Municipal Corporations, Health Departments, and Disaster Authorities.
    """
    alert_level = wbgt_data["alert_level"]
    hospital_surge = mortality_data["hospital_admission_surge_pct"]
    
    actions: List[Dict[str, str]] = []

    if alert_level in ["RED_ALERT", "EXTREME_DANGER"]:
        actions.append({
            "sector": "Labor & Industry",
            "priority": "HIGH",
            "directive": "MANDATORY OUTDOOR WORK CURFEW: All construction, courier, and street vending halted between 11:30 AM and 4:30 PM."
        })
        actions.append({
            "sector": "Healthcare & Hospitals",
            "priority": "CRITICAL",
            "directive": f"Activate Heat Stroke Emergency Wards: Reserve +{mortality_data['estimated_excess_daily_hospitalizations']} ICU/dehydration beds; stock IV fluids & ORS packets in primary health centers."
        })
        actions.append({
            "sector": "Municipal Water & Cooling",
            "priority": "HIGH",
            "directive": f"Deploy 8 Mist Sprinkler Trucks across major transit hubs in {ward_name}; open 12 air-cooled public shelters (Temples, Community Halls, Metro stations)."
        })
        actions.append({
            "sector": "Power & Energy Grid",
            "priority": "MEDIUM",
            "directive": "Anticipate +35% AC cooling load surge; defer non-essential industrial grid draws to prevent localized transformer trippings."
        })
    elif alert_level == "ORANGE_ALERT":
        actions.append({
            "sector": "Labor & Industry",
            "priority": "MEDIUM",
            "directive": "Mandate 30-min shaded rest breaks per working hour. Ensure free chilled drinking water on all construction sites."
        })
        actions.append({
            "sector": "Healthcare & Hospitals",
            "priority": "HIGH",
            "directive": f"Alert emergency triage: Expected +{hospital_surge}% spike in cardiovascular and heat exhaustion visits."
        })
        actions.append({
            "sector": "Municipal & Transport",
            "priority": "MEDIUM",
            "directive": "Operate road water sprinkling along dense asphalt corridors to mitigate Urban Heat Island radiation."
        })
    else:
        actions.append({
            "sector": "Public Health Advisory",
            "priority": "LOW",
            "directive": "Standard hydration awareness advisory broadcasted via community radio and SMS."
        })

    return {
        "ward_name": ward_name,
        "generated_timestamp": "Real-Time Automated Dispatch",
        "action_items": actions,
        "sms_broadcast_template": (
            f"⚠️ [MUNICIPAL HEAT ALERT - {ward_name.upper()}]: Extreme Thermal Stress forecasted! "
            f"WBGT: {wbgt_data['wbgt']}°C ({alert_level}). Avoid direct sun 12-4 PM. "
            f"Free cooling centers & ORS available at Ward Community Center. Stay hydrated!"
        )
    }

def simulate_mitigation_impact(current_wbgt: float, current_hvi: float, interventions: Dict[str, bool]) -> Dict[str, Any]:
    """
    "What-If" Heat Mitigation Simulator
    Simulates how much thermal stress and mortality drops when specific interventions are activated.
    """
    delta_wbgt = 0.0
    delta_hvi = 0.0

    if interventions.get("mist_sprinklers", False):
        delta_wbgt += 1.4 # evaporative cooling lowers ambient globe temp
    if interventions.get("cool_roof_paint", False):
        delta_wbgt += 0.8
        delta_hvi += 0.12 # improves slum housing resilience
    if interventions.get("shade_canopies", False):
        delta_wbgt += 1.1 # reduces radiant solar load (Tg)
    if interventions.get("emergency_cooling_shelters", False):
        delta_hvi += 0.18 # directly protects vulnerable elderly & outdoor workers

    new_wbgt = max(24.0, current_wbgt - delta_wbgt)
    new_hvi = max(0.1, current_hvi - delta_hvi)

    before_risk = predict_mortality_and_hospital_surge(current_wbgt, current_hvi)
    after_risk = predict_mortality_and_hospital_surge(new_wbgt, new_hvi)

    deaths_prevented = max(0, before_risk["estimated_excess_daily_mortality"] - after_risk["estimated_excess_daily_mortality"])
    hospital_reduction_pct = max(0.0, round(before_risk["hospital_admission_surge_pct"] - after_risk["hospital_admission_surge_pct"], 1))

    return {
        "original_wbgt": current_wbgt,
        "mitigated_wbgt": round(new_wbgt, 2),
        "temperature_reduction_c": round(delta_wbgt, 2),
        "original_mri": before_risk["mortality_risk_index"],
        "mitigated_mri": after_risk["mortality_risk_index"],
        "hospital_surge_reduction_pct": hospital_reduction_pct,
        "estimated_lives_protected_daily": deaths_prevented
    }
