"""
Pydantic Schemas with Strict Data Validation for ThermoGuard ML Service
Rejects NaN, Infinity, Negative Values, and Unreasonable Meteorological Inputs.
"""

import math
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


def _check_finite(value: Optional[float], field_name: str) -> Optional[float]:
    """Helper to reject NaN and Infinity values."""
    if value is not None:
        if math.isnan(value):
            raise ValueError(f"'{field_name}' must be a valid number, received NaN.")
        if math.isinf(value):
            raise ValueError(f"'{field_name}' must be a finite number, received Infinity.")
    return value


class PredictionRequest(BaseModel):
    """
    Strict validation schema for input meteorological and exposure features.
    """
    temperature: float = Field(
        ...,
        description="Ambient dry-bulb temperature in Celsius (°C)",
        ge=-15.0,
        le=65.0,
        examples=[44.5],
    )
    humidity: float = Field(
        ...,
        description="Relative humidity in percentage (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[35.0],
    )
    wind_speed: float = Field(
        default=2.5,
        description="Wind speed in meters per second (m/s) at 10m height",
        ge=0.0,
        le=60.0,
        examples=[3.2],
    )
    solar_radiation: float = Field(
        default=800.0,
        description="Global horizontal solar radiation in W/m²",
        ge=0.0,
        le=1400.0,
        examples=[850.0],
    )
    surface_pressure: float = Field(
        default=1000.0,
        description="Surface barometric pressure in hPa",
        ge=700.0,
        le=1100.0,
        examples=[1002.0],
    )
    dew_point: Optional[float] = Field(
        default=None,
        description="Dew point temperature in °C (must not exceed dry-bulb temperature)",
        ge=-30.0,
        le=45.0,
        examples=[22.0],
    )
    uv_index: float = Field(
        default=8.0,
        description="UV Radiation Index (0 - 25)",
        ge=0.0,
        le=25.0,
        examples=[10.5],
    )
    latitude: float = Field(
        default=28.61,
        description="Latitude of location (-90 to 90)",
        ge=-90.0,
        le=90.0,
        examples=[28.6139],
    )
    longitude: float = Field(
        default=77.20,
        description="Longitude of location (-180 to 180)",
        ge=-180.0,
        le=180.0,
        examples=[77.2090],
    )
    consecutive_hot_days: int = Field(
        default=1,
        description="Count of consecutive hot days (>= 40°C)",
        ge=0,
        le=60,
        examples=[3],
    )
    is_urban: bool = Field(
        default=True,
        description="Flag indicating urban core with Urban Heat Island effect",
        examples=[True],
    )
    population_density: float = Field(
        default=10000.0,
        description="Estimated population density (persons per km²)",
        ge=0.0,
        le=200000.0,
        examples=[14500.0],
    )

    @field_validator(
        "temperature",
        "humidity",
        "wind_speed",
        "solar_radiation",
        "surface_pressure",
        "uv_index",
        "latitude",
        "longitude",
        "population_density",
        mode="before",
    )
    @classmethod
    def validate_finite_numbers(cls, v, info):
        if v is None:
            return v
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError(f"'{info.field_name}' must be a valid numeric value.")
        _check_finite(val, info.field_name)
        return val

    @field_validator("dew_point", mode="before")
    @classmethod
    def validate_dew_point_finite(cls, v):
        if v is None:
            return None
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError("'dew_point' must be a valid numeric value.")
        _check_finite(val, "dew_point")
        return val

    @model_validator(mode="after")
    def validate_psychrometric_consistency(self):
        """Validates physical psychrometric consistency between dew point and dry bulb."""
        if self.dew_point is not None:
            if self.dew_point > self.temperature + 0.5:
                raise ValueError(
                    f"Physically invalid: Dew point ({self.dew_point}°C) cannot exceed dry-bulb temperature ({self.temperature}°C)."
                )
        return self


class RiskFactor(BaseModel):
    feature: str = Field(..., description="Feature / risk driver name")
    weight: float = Field(..., description="Relative contribution weight", ge=0.0, le=1.0)
    description: str = Field(..., description="Clear explanation of the risk mechanism")


class EngineeredFeaturesOutput(BaseModel):
    dew_point_c: float
    vapor_pressure_hpa: float
    vapor_pressure_deficit_hpa: float
    dew_point_depression_c: float
    moist_air_enthalpy_kj_kg: float
    effective_solar_heat_load_w_m2: float
    compound_stress_multiplier: float
    cumulative_hotspell_severity: float
    uhi_offset_c: float


class PredictionResponse(BaseModel):
    """
    Validated deterministic prediction response schema.
    """
    mortality_risk_score: float = Field(
        ...,
        description="Heat mortality risk score percentage (0 - 100%)",
        ge=0.0,
        le=100.0,
    )
    risk_category: str = Field(
        ...,
        description="Risk category classification: Low, Moderate, High, Extreme, Catastrophic",
    )
    predicted_wbgt: float = Field(
        ...,
        description="Estimated Wet-Bulb Globe Temperature (°C)",
    )
    predicted_utci: float = Field(
        ...,
        description="Estimated Universal Thermal Climate Index (°C)",
    )
    heat_index: float = Field(
        ...,
        description="NOAA Heat Index (°C)",
    )
    alert_level: str = Field(
        ...,
        description="IMD 4-tier alert level: GREEN, YELLOW, ORANGE, RED",
    )
    alert_code: str = Field(
        ...,
        description="System code: GREEN_NORMAL, YELLOW_WATCH, ORANGE_ALERT, RED_WARNING",
    )
    confidence_score: float = Field(
        ...,
        description="Prediction confidence (0.0 - 1.0)",
        ge=0.0,
        le=1.0,
    )
    model_status: str = Field(
        ...,
        description="Model execution mode ('baseline_engine' or 'xgboost_model')",
    )
    top_risk_factors: List[RiskFactor] = Field(
        default_factory=list,
        description="Explainable AI risk drivers",
    )
    engineered_features: EngineeredFeaturesOutput = Field(
        ...,
        description="Thermodynamic engineered feature vector summary",
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 UTC timestamp",
    )


class HealthResponse(BaseModel):
    """
    Health check response model.
    """
    status: str
    service: str
    version: str
    model_loaded: bool
    model_path: str
    timestamp: str
