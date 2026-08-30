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
    Strict validation schema for input meteorological, temporal, lag, and vulnerability features.
    """
    # Core Weather
    temperature: float = Field(
        ...,
        description="Ambient dry-bulb temperature in Celsius (°C)",
        ge=-15.0,
        le=65.0,
        examples=[44.5],
    )
    humidity: Optional[float] = Field(
        default=None,
        description="Relative humidity in percentage (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[35.0],
    )
    relative_humidity: Optional[float] = Field(
        default=None,
        description="Alternative alias for relative humidity (0 - 100%)",
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
    rainfall_mm: float = Field(
        default=0.0,
        description="Precipitation rainfall accumulation in mm",
        ge=0.0,
        le=500.0,
        examples=[0.0],
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

    # Location & Urban Parameters
    location_id: Optional[str] = Field(
        default=None,
        description="Location identifier, e.g. city code or district name",
        examples=["delhi"],
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
    is_urban: bool = Field(
        default=True,
        description="Flag indicating urban core with Urban Heat Island effect",
        examples=[True],
    )

    # Optional Client-Supplied Thermal Variables (re-verified & recalculated by server)
    heat_index: Optional[float] = Field(
        default=None,
        description="Optional client-estimated heat index (°C)",
        ge=-10.0,
        le=100.0,
    )
    wbgt: Optional[float] = Field(
        default=None,
        description="Optional client-estimated WBGT (°C)",
        ge=-10.0,
        le=60.0,
    )
    utci: Optional[float] = Field(
        default=None,
        description="Optional client-estimated UTCI (°C)",
        ge=-50.0,
        le=80.0,
    )

    # Temporal Parameters
    date: Optional[str] = Field(
        default=None,
        description="Observation date string (YYYY-MM-DD)",
        examples=["2026-05-15"],
    )
    observation_time: Optional[str] = Field(
        default=None,
        description="ISO 8601 observation timestamp (e.g. '2026-05-15T14:30:00Z')",
    )
    hour: Optional[int] = Field(
        default=None,
        description="Hour of day (0 - 23)",
        ge=0,
        le=23,
    )
    day: Optional[int] = Field(
        default=None,
        description="Day of month (1 - 31)",
        ge=1,
        le=31,
    )
    month: Optional[int] = Field(
        default=None,
        description="Month of year (1 - 12)",
        ge=1,
        le=12,
    )
    day_of_year: Optional[int] = Field(
        default=None,
        description="Day of year (1 - 366)",
        ge=1,
        le=366,
    )
    consecutive_hot_days: int = Field(
        default=1,
        description="Count of consecutive hot days (>= 40°C)",
        ge=0,
        le=60,
        examples=[3],
    )

    # Historical Lag Features (No future data leakage)
    temp_lag_1d: Optional[float] = Field(
        default=None,
        description="Prior day temperature lag (°C)",
        ge=-15.0,
        le=65.0,
    )
    temp_lag_2d: Optional[float] = Field(
        default=None,
        description="2-day prior temperature lag (°C)",
        ge=-15.0,
        le=65.0,
    )
    temp_lag_3d: Optional[float] = Field(
        default=None,
        description="3-day prior temperature lag (°C)",
        ge=-15.0,
        le=65.0,
    )
    wbgt_lag_1d: Optional[float] = Field(
        default=None,
        description="Prior day WBGT lag (°C)",
        ge=-10.0,
        le=55.0,
    )
    wbgt_lag_2d: Optional[float] = Field(
        default=None,
        description="2-day prior WBGT lag (°C)",
        ge=-10.0,
        le=55.0,
    )
    wbgt_lag_3d: Optional[float] = Field(
        default=None,
        description="3-day prior WBGT lag (°C)",
        ge=-10.0,
        le=55.0,
    )

    # Vulnerability Demographic Features
    population_density: float = Field(
        default=10000.0,
        description="Estimated population density (persons per km²)",
        ge=0.0,
        le=200000.0,
        examples=[14500.0],
    )
    elderly_percentage: Optional[float] = Field(
        default=None,
        description="Percentage of elderly population aged 65+ (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[8.6],
    )
    outdoor_worker_percentage: Optional[float] = Field(
        default=None,
        description="Percentage of outdoor/informal workers exposed to heat (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[18.5],
    )
    children_percentage: Optional[float] = Field(
        default=None,
        description="Percentage of children aged 0-5 (0 - 100%)",
        ge=0.0,
        le=100.0,
        examples=[11.2],
    )

    @field_validator(
        "temperature",
        "humidity",
        "relative_humidity",
        "wind_speed",
        "solar_radiation",
        "surface_pressure",
        "rainfall_mm",
        "uv_index",
        "latitude",
        "longitude",
        "population_density",
        "elderly_percentage",
        "outdoor_worker_percentage",
        "children_percentage",
        "temp_lag_1d",
        "temp_lag_2d",
        "temp_lag_3d",
        "wbgt_lag_1d",
        "wbgt_lag_2d",
        "wbgt_lag_3d",
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
    def validate_humidity_and_psychrometrics(self):
        """Ensures humidity is provided via either 'humidity' or 'relative_humidity'."""
        if self.humidity is None and self.relative_humidity is None:
            raise ValueError("Missing required humidity: specify either 'humidity' or 'relative_humidity'.")
        if self.humidity is None:
            self.humidity = self.relative_humidity
        if self.relative_humidity is None:
            self.relative_humidity = self.humidity

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
    # Core Thermodynamic
    dew_point_c: float
    vapor_pressure_hpa: float
    vapor_pressure_deficit_hpa: float
    dew_point_depression_c: float
    moist_air_enthalpy_kj_kg: float
    effective_solar_heat_load_w_m2: float
    compound_stress_multiplier: float
    cumulative_hotspell_severity: float
    uhi_offset_c: float

    # Additional Thermal & Exposure
    wbgt_shade_c: Optional[float] = None
    wet_bulb_temp_c: Optional[float] = None
    cumulative_heat_exposure_deg_days: Optional[float] = None
    thermal_recovery_penalty: Optional[float] = None

    # Pipeline Schema & Dimensionality
    feature_schema_version: Optional[str] = "v1.0.0"
    feature_count: Optional[int] = 25


class PredictionResponse(BaseModel):
    """
    Validated deterministic prediction response schema matching strict production API specification.
    """
    # Required core response fields
    model_version: str = Field(
        default="v1.0.0",
        description="Active ML model version tag",
        examples=["v1.0.0"],
    )
    thermal_stress: float = Field(
        ...,
        description="Compound human thermal stress index (0 - 100)",
        ge=0.0,
        le=100.0,
        examples=[72.5],
    )
    mortality_risk: float = Field(
        ...,
        description="Heatwave-induced excess mortality risk score (0 - 100)",
        ge=0.0,
        le=100.0,
        examples=[45.2],
    )
    hospitalization_risk: float = Field(
        ...,
        description="Heat-related emergency room and hospitalization admission risk index (0 - 100)",
        ge=0.0,
        le=100.0,
        examples=[58.0],
    )
    risk_level: str = Field(
        ...,
        description="Categorical risk tier: VERY_LOW, LOW, MODERATE, HIGH, EXTREME",
        examples=["HIGH"],
    )
    prediction_timestamp: str = Field(
        ...,
        description="ISO 8601 UTC prediction timestamp",
    )
    feature_schema_version: str = Field(
        default="v1.0.0",
        description="Version tag of the 25-feature input schema",
    )

    # Backward-compatible & Extended Explanatory fields
    mortality_risk_score: Optional[float] = Field(
        default=None,
        description="Alias for mortality_risk percentage (0 - 100%)",
    )
    risk_category: Optional[str] = Field(
        default=None,
        description="Risk category classification: Low, Moderate, High, Extreme, Catastrophic",
    )
    predicted_wbgt: Optional[float] = Field(
        default=None,
        description="Estimated Wet-Bulb Globe Temperature (°C)",
    )
    predicted_utci: Optional[float] = Field(
        default=None,
        description="Estimated Universal Thermal Climate Index (°C)",
    )
    heat_index: Optional[float] = Field(
        default=None,
        description="NOAA Heat Index (°C)",
    )
    alert_level: Optional[str] = Field(
        default=None,
        description="IMD 4-tier alert level: GREEN, YELLOW, ORANGE, RED",
    )
    alert_code: Optional[str] = Field(
        default=None,
        description="System code: GREEN_NORMAL, YELLOW_WATCH, ORANGE_ALERT, RED_WARNING",
    )
    confidence_score: Optional[float] = Field(
        default=0.98,
        description="Prediction confidence (0.0 - 1.0)",
    )
    model_status: Optional[str] = Field(
        default="xgboost_model",
        description="Model execution mode ('baseline_engine' or 'xgboost_model')",
    )
    combined_risk_score: Optional[float] = Field(
        default=None,
        description="Unified deterministic combined risk score (0 - 100)",
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Prioritized administrative decision-support action recommendations",
    )
    top_risk_factors: List[RiskFactor] = Field(
        default_factory=list,
        description="Explainable AI risk drivers",
    )
    engineered_features: Optional[EngineeredFeaturesOutput] = Field(
        default=None,
        description="Thermodynamic engineered feature vector summary",
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="Alias for prediction_timestamp",
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
