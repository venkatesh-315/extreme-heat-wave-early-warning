"""
Pydantic Schemas for Heatwave Prediction Request and Response Models
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, field_validator


class HeatwavePredictionRequest(BaseModel):
    """
    Input meteorological & demographic features for ML heatwave risk prediction.
    """
    temperature: float = Field(
        ...,
        description="Ambient dry-bulb temperature in Celsius (°C)",
        ge=0.0,
        le=65.0,
        examples=[44.5]
    )
    humidity: float = Field(
        ...,
        description="Relative humidity in percentage (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[32.0]
    )
    wind_speed: float = Field(
        default=2.5,
        description="Wind speed at 10m in meters per second (m/s) or km/h",
        ge=0.0,
        le=60.0,
        examples=[3.2]
    )
    solar_radiation: float = Field(
        default=850.0,
        description="Global horizontal / direct solar irradiance in W/m²",
        ge=0.0,
        le=1400.0,
        examples=[920.0]
    )
    surface_pressure: float = Field(
        default=1000.0,
        description="Atmospheric surface pressure in hPa",
        ge=800.0,
        le=1100.0,
        examples=[998.0]
    )
    dew_point: Optional[float] = Field(
        default=None,
        description="Dew point temperature in °C (auto-computed if None)",
        ge=-20.0,
        le=40.0,
        examples=[22.4]
    )
    uv_index: float = Field(
        default=10.0,
        description="UV Index (0 - 15+)",
        ge=0.0,
        le=20.0,
        examples=[11.5]
    )
    latitude: float = Field(
        default=28.61,
        description="Latitude of target region (for terrain/hills thresholding)",
        ge=-90.0,
        le=90.0,
        examples=[28.6139]
    )
    longitude: float = Field(
        default=77.20,
        description="Longitude of target region",
        ge=-180.0,
        le=180.0,
        examples=[77.2090]
    )
    consecutive_hot_days: int = Field(
        default=1,
        description="Number of consecutive days above 40°C threshold (heat accumulation)",
        ge=0,
        le=30,
        examples=[3]
    )
    is_urban: bool = Field(
        default=True,
        description="Whether target zone is an urban core with Urban Heat Island (UHI) effect",
        examples=[True]
    )
    population_density: float = Field(
        default=12000.0,
        description="Estimated population density per km² (for human exposure weighting)",
        ge=0.0,
        examples=[18500.0]
    )

    @field_validator("wind_speed")
    @classmethod
    def normalize_wind_speed(cls, v: float) -> float:
        # If user provides wind speed in km/h (> 15 m/s in typical summer heat), convert to m/s
        if v > 15.0:
            return round(v / 3.6, 2)
        return round(v, 2)


class RiskFactorContribution(BaseModel):
    feature: str = Field(..., description="Feature name or thermodynamic metric")
    contribution_weight: float = Field(..., description="Normalized contribution magnitude")
    description: str = Field(..., description="Human-readable impact explanation")


class EngineeredFeaturesSummary(BaseModel):
    dew_point_c: float
    vapor_pressure_hpa: float
    vapor_pressure_deficit_hpa: float
    dew_point_depression_c: float
    enthalpy_kj_kg: float
    effective_solar_heat_load: float
    compound_stress_multiplier: float
    cumulative_hotspell_severity: float
    uhi_temperature_offset_c: float


class HeatwavePredictionResponse(BaseModel):
    """
    Standardized response payload from XGBoost ML inference engine.
    """
    mortality_risk_score: float = Field(
        ...,
        description="Estimated population heat mortality & emergency risk index (0 - 100%)",
        ge=0.0,
        le=100.0
    )
    risk_category: str = Field(
        ...,
        description="Risk category classification: Low, Moderate, High, Extreme, Catastrophic"
    )
    predicted_wbgt: float = Field(
        ...,
        description="Machine Learning calibrated Wet-Bulb Globe Temperature (°C)"
    )
    predicted_utci: float = Field(
        ...,
        description="Universal Thermal Climate Index (°C)"
    )
    heat_index: float = Field(
        ...,
        description="Computed NOAA Heat Index (°C)"
    )
    alert_level: str = Field(
        ...,
        description="IMD 4-tier alert level: GREEN, YELLOW, ORANGE, RED"
    )
    alert_code: str = Field(
        ...,
        description="System code: GREEN_NORMAL, YELLOW_WATCH, ORANGE_ALERT, RED_WARNING"
    )
    confidence_score: float = Field(
        ...,
        description="Model prediction confidence score (0 - 1.0)",
        ge=0.0,
        le=1.0
    )
    model_version: str = Field(
        default="ThermoGuard-XGBoost-v1.0",
        description="Active model identifier"
    )
    top_risk_factors: List[RiskFactorContribution] = Field(
        default_factory=list,
        description="Top driving risk features for explainability"
    )
    engineered_features: EngineeredFeaturesSummary = Field(
        ...,
        description="Extracted thermodynamic and compound biometeorological features"
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 prediction timestamp"
    )
