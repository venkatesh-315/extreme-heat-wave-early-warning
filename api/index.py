"""
FastAPI Server & Vercel Serverless Function Handler
SIH-26083: Extreme Heatwave Early Warning and Human Thermal Stress Index
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import requests
import os

try:
    from .thermal_engine import compute_all_thermal_metrics, calculate_wbgt
    from .mortality_model import (
        calculate_hvi,
        predict_mortality_and_hospital_surge,
        generate_automated_heat_action_plan,
        simulate_mitigation_impact
    )
except ImportError:
    # Handle direct execution
    from thermal_engine import compute_all_thermal_metrics, calculate_wbgt
    from mortality_model import (
        calculate_hvi,
        predict_mortality_and_hospital_surge,
        generate_automated_heat_action_plan,
        simulate_mitigation_impact
    )

app = FastAPI(
    title="THERMA-GUARD (सुरक्षा-ताप) - SIH-26083",
    description="Hyper-Local Human Thermal Stress (WBGT/UTCI) & Predictive Mortality Risk API",
    version="1.0.0"
)

# Enable CORS for local development and Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class WardAssessmentRequest(BaseModel):
    ward_id: str
    ward_name: str
    temp_c: float
    humidity_pct: float
    wind_speed_ms: float
    solar_rad_wm2: float
    elderly_pct: float = 12.0
    outdoor_worker_pct: float = 28.0
    slum_density_pct: float = 25.0
    green_cover_pct: float = 14.0
    hospital_distance_km: float = 2.0
    population: int = 120000

class MitigationSimRequest(BaseModel):
    current_wbgt: float
    current_hvi: float
    mist_sprinklers: bool = False
    cool_roof_paint: bool = False
    shade_canopies: bool = False
    emergency_cooling_shelters: bool = False

# Simulated Ward Data for Indian Metros
SAMPLE_WARDS = [
    {
        "id": "W-01",
        "name": "Old City / Chawri Bazaar",
        "zone": "Central Zone",
        "coords": [28.6506, 77.2303],
        "demographics": {
            "elderly_pct": 14.2,
            "outdoor_worker_pct": 42.0,
            "slum_density_pct": 52.0,
            "green_cover_pct": 4.5,
            "hospital_distance_km": 1.2
        },
        "population": 185000,
        "base_temp_offset": 2.4 # High Urban Heat Island (UHI) effect
    },
    {
        "id": "W-02",
        "name": "Industrial Hub & Logistics Park",
        "zone": "North-West Zone",
        "coords": [28.7150, 77.1350],
        "demographics": {
            "elderly_pct": 8.0,
            "outdoor_worker_pct": 55.0,
            "slum_density_pct": 38.0,
            "green_cover_pct": 6.2,
            "hospital_distance_km": 3.8
        },
        "population": 140000,
        "base_temp_offset": 1.8
    },
    {
        "id": "W-03",
        "name": "Civil Lines & Institutional Enclave",
        "zone": "North Zone",
        "coords": [28.6812, 77.2228],
        "demographics": {
            "elderly_pct": 16.5,
            "outdoor_worker_pct": 12.0,
            "slum_density_pct": 5.0,
            "green_cover_pct": 38.0,
            "hospital_distance_km": 0.8
        },
        "population": 95000,
        "base_temp_offset": -1.5 # High green cover cooling
    },
    {
        "id": "W-04",
        "name": "Informal Settlement & Riverbank Basti",
        "zone": "East Zone",
        "coords": [28.6320, 77.2800],
        "demographics": {
            "elderly_pct": 11.5,
            "outdoor_worker_pct": 48.0,
            "slum_density_pct": 68.0,
            "green_cover_pct": 8.0,
            "hospital_distance_km": 4.2
        },
        "population": 210000,
        "base_temp_offset": 2.1
    },
    {
        "id": "W-05",
        "name": "Commercial District & Transit Hub",
        "zone": "South Zone",
        "coords": [28.5600, 77.2100],
        "demographics": {
            "elderly_pct": 12.0,
            "outdoor_worker_pct": 34.0,
            "slum_density_pct": 18.0,
            "green_cover_pct": 18.0,
            "hospital_distance_km": 1.5
        },
        "population": 130000,
        "base_temp_offset": 0.5
    }
]

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "THERMA-GUARD Thermal Stress & Mortality Early Warning Platform",
        "version": "1.0.0",
        "supported_indices": ["WBGT", "UTCI", "NOAA Heat Index", "HVI", "Mortality Surge RR"]
    }

@app.get("/api/weather-forecast")
def get_weather_forecast(lat: float = 28.6139, lon: float = 77.2090):
    """
    Fetches real-time 5-day weather & solar radiation forecast from Open-Meteo (100% Free API).
    Includes temperature, relative humidity, wind speed (10m), and solar radiation.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,relative_humidity_2m_max,wind_speed_10m_max,shortwave_radiation_sum"
            f"&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,direct_normal_irradiance"
            f"&timezone=Asia%2FKolkata&forecast_days=5"
        )
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return {"source": "Open-Meteo Live API", "data": response.json()}
    except Exception:
        pass
    
    # Graceful fallback simulation if external network is unavailable
    return {
        "source": "Simulated Weather Engine",
        "data": {
            "daily": {
                "time": ["2026-05-15", "2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19"],
                "temperature_2m_max": [41.2, 42.8, 44.5, 45.1, 43.0],
                "relative_humidity_2m_max": [58, 62, 65, 68, 60],
                "wind_speed_10m_max": [2.4, 2.1, 1.8, 1.5, 2.8],
                "shortwave_radiation_sum": [24.5, 26.1, 27.8, 28.2, 25.0]
            }
        }
    }

@app.post("/api/assess-ward")
def assess_ward(payload: WardAssessmentRequest):
    """
    Full pipeline endpoint: Computes Thermal Metrics (WBGT, UTCI, HI) -> HVI -> Mortality Risk -> Heat Action Plan.
    """
    thermal = compute_all_thermal_metrics(
        temp_c=payload.temp_c,
        humidity_pct=payload.humidity_pct,
        wind_speed_ms=payload.wind_speed_ms,
        solar_rad_wm2=payload.solar_rad_wm2
    )

    hvi = calculate_hvi({
        "elderly_pct": payload.elderly_pct,
        "outdoor_worker_pct": payload.outdoor_worker_pct,
        "slum_density_pct": payload.slum_density_pct,
        "green_cover_pct": payload.green_cover_pct,
        "hospital_distance_km": payload.hospital_distance_km
    })

    wbgt_val = thermal["wbgt"]["wbgt"]
    mortality = predict_mortality_and_hospital_surge(
        wbgt_val=wbgt_val,
        hvi_score=hvi["hvi_score"],
        baseline_population=payload.population
    )

    action_plan = generate_automated_heat_action_plan(
        wbgt_data=thermal["wbgt"],
        mortality_data=mortality,
        ward_name=payload.ward_name
    )

    return {
        "ward_id": payload.ward_id,
        "ward_name": payload.ward_name,
        "thermal_stress": thermal,
        "vulnerability_hvi": hvi,
        "predictive_mortality": mortality,
        "heat_action_plan": action_plan
    }

@app.get("/api/wards-summary")
def get_all_wards_summary(day_offset: int = Query(0, ge=0, le=4)):
    """
    Returns complete geospatial ward dataset with 5-day heatwave progression forecast.
    """
    # Base synoptic weather across 5 days (Simulating a worsening heatwave)
    days_synoptic = [
        {"day": "Day 1 (Today)", "base_temp": 41.5, "humidity": 55, "wind": 2.5, "solar": 850},
        {"day": "Day 2 (+24h)", "base_temp": 43.0, "humidity": 58, "wind": 2.2, "solar": 890},
        {"day": "Day 3 (+48h Peak)", "base_temp": 44.8, "humidity": 62, "wind": 1.7, "solar": 940},
        {"day": "Day 4 (+72h Peak)", "base_temp": 45.4, "humidity": 64, "wind": 1.4, "solar": 960},
        {"day": "Day 5 (+96h)", "base_temp": 43.2, "humidity": 59, "wind": 2.6, "solar": 880},
    ]

    weather = days_synoptic[day_offset]
    results = []

    for ward in SAMPLE_WARDS:
        temp = weather["base_temp"] + ward["base_temp_offset"]
        humidity = weather["humidity"]
        wind = weather["wind"]
        solar = weather["solar"]

        thermal = compute_all_thermal_metrics(temp, humidity, wind, solar)
        hvi = calculate_hvi(ward["demographics"])
        mortality = predict_mortality_and_hospital_surge(
            wbgt_val=thermal["wbgt"]["wbgt"],
            hvi_score=hvi["hvi_score"],
            baseline_population=ward["population"]
        )
        action_plan = generate_automated_heat_action_plan(
            wbgt_data=thermal["wbgt"],
            mortality_data=mortality,
            ward_name=ward["name"]
        )

        results.append({
            "id": ward["id"],
            "name": ward["name"],
            "zone": ward["zone"],
            "coords": ward["coords"],
            "population": ward["population"],
            "demographics": ward["demographics"],
            "weather": {
                "temp_c": round(temp, 1),
                "humidity_pct": humidity,
                "wind_speed_ms": wind,
                "solar_rad_wm2": solar
            },
            "thermal": thermal,
            "hvi": hvi,
            "mortality": mortality,
            "action_plan": action_plan
        })

    # Calculate City-Wide Aggregate Metrics
    total_pop_at_risk = sum(w["mortality"]["population_at_risk"] for w in results)
    total_excess_admissions = sum(w["mortality"]["estimated_excess_daily_hospitalizations"] for w in results)
    total_excess_mortality = sum(w["mortality"]["estimated_excess_daily_mortality"] for w in results)
    max_wbgt = max(w["thermal"]["wbgt"]["wbgt"] for w in results)

    return {
        "selected_day": weather["day"],
        "day_offset": day_offset,
        "city_overview": {
            "max_city_wbgt": max_wbgt,
            "total_population_at_risk": total_pop_at_risk,
            "predicted_excess_daily_admissions": total_excess_admissions,
            "predicted_excess_daily_mortality": total_excess_mortality,
            "city_alert_status": "RED_ALERT" if max_wbgt >= 31.0 else "ORANGE_ALERT"
        },
        "wards": results
    }

@app.post("/api/simulate-mitigation")
def simulate_mitigation(payload: MitigationSimRequest):
    """
    Simulates real-time drop in WBGT, Mortality Risk, and Hospital admissions
    when municipal interventions (misting, cooling centers, cool roofs) are toggled.
    """
    interventions = {
        "mist_sprinklers": payload.mist_sprinklers,
        "cool_roof_paint": payload.cool_roof_paint,
        "shade_canopies": payload.shade_canopies,
        "emergency_cooling_shelters": payload.emergency_cooling_shelters
    }
    return simulate_mitigation_impact(payload.current_wbgt, payload.current_hvi, interventions)

@app.post("/api/send-alert-preview")
def send_alert_preview(ward_name: str = "Old City", channel: str = "whatsapp"):
    """
    Generates preview for WhatsApp, SMS, or Telegram alerts.
    """
    return {
        "status": "success",
        "channel": channel,
        "recipient_group": f"{ward_name} Municipal Quick Response Team & Registered Citizens",
        "message": (
            f"🚨 [HEAT EMERGENCY ALERT]: WBGT in {ward_name} exceeds 32.2°C (RED ALERT). "
            "Hospitalization surge risk +48%. Stay indoors from 11:30 AM to 4:30 PM. "
            "Municipal Water Tankers deployed at Chowk Center. Dial 108 for Heat Stroke Triage."
        ),
        "dispatched_at": "Just now"
    }
