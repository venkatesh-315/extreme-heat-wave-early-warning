# ThermoGuard Data Integration & Architecture Freeze Audit

**Audit Date:** August 31, 2026  
**Document Purpose:** Freeze existing core implementations and specify the safe integration boundary for real-world India-wide meteorological, spatial, and epidemiological health data ingestion without modifying or destabilizing completed components.

---

## 1. Current System Architecture

The ThermoGuard platform is currently organized into three primary operational tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. CLIENT & GIS TIER                              │
│  React 19 + Vite + Leaflet GIS Dashboard (HumanThermalStressCard, Map, etc.) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP /api Proxy (Port 5000)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                           2. BACKEND API TIER                               │
│  Express.js Server, Auth, WeatherSync, ML Forecasting & MongoDB Persistence  │
└──────────────────┬───────────────────────────────────────────┬──────────────┘
                   │ HTTP In-Process / Remote                  │ Mongoose
┌──────────────────▼──────────────────┐         ┌──────────────▼──────────────┐
│      3. ML INFERENCE TIER           │         │     4. DATABASE TIER        │
│  FastAPI (Port 8000), XGBoost Models│         │  MongoDB (Port 27017)       │
│  Thermodynamic & Feature Engines    │         │  MLPrediction, WeatherData  │
└─────────────────────────────────────┘         └─────────────────────────────┘
```

---

## 2. Current End-to-End Data & Prediction Flow

1. **Weather Observation & Forecast Input:**
   * Handled by `weatherSyncService.js` connecting to Open-Meteo with fallback to climatological baseline models.
2. **Physical Validation & Thermal Index Derivation:**
   * Executed by `thermalCalculationService.js` and `ml-service/app/thermal.py` (ISO 7933 Outdoor WBGT, UTCI, Steadman Heat Index).
3. **Canonical Feature Transformation:**
   * Executed by `ml-service/app/features.py` producing a deterministic 25-feature vector with strictly anti-leakage temporal lags.
4. **XGBoost Inference & Risk Classification:**
   * Executed by `ml-service/app/prediction.py` and `app/risk_engine.py` deriving `thermal_stress`, `mortality_risk`, `hospitalization_risk`, `risk_level` (`VERY_LOW` to `EXTREME`), and NDMA action directives.
5. **Idempotent Persistence:**
   * Managed by `mlPersistenceService.js` using compound unique indexes on `{ location_id, prediction_date, forecast_horizon, model_version }`.
6. **Master Overview Presentation:**
   * Aggregated by `dashboardController.js` returning live telemetry, 5-day ML forecasts, and ML-annotated microclimate wards to the frontend.

---

## 3. Freeze List: Existing Files That Must Not Be Modified

The following files represent validated, audited, and tested core logic that **must remain intact**:

| Component Tier | File Path | Protected Functionality |
| :--- | :--- | :--- |
| **ML Engine** | `ml-service/app/thermal.py` | Validated physical formulas (WBGT, UTCI, Heat Index, Enthalpy) |
| **ML Engine** | `ml-service/app/features.py` | Canonical 25-feature schema & deterministic feature ordering |
| **ML Engine** | `ml-service/app/prediction.py` | XGBoost prediction coordination & legacy fallback |
| **ML Engine** | `ml-service/app/risk_engine.py` | Deterministic 5-tier risk matrix & NDMA action mapping |
| **ML Engine** | `ml-service/app/risk_config.py` | Threshold boundaries and recommendation rules |
| **ML Engine** | `ml-service/app/model.py` | Path-confined model loader |
| **Backend** | `backend/src/services/thermalCalculationService.js` | Backend thermodynamic equations |
| **Backend** | `backend/src/services/mlClientService.js` | Circuit breaker & resilient Python ML client bridge |
| **Backend** | `backend/src/services/mlPersistenceService.js` | MongoDB deduplication & resilient persistence store |
| **Backend** | `backend/src/services/mlForecastService.js` | 3-5 day horizon forecasting workflow |
| **Backend** | `backend/src/controllers/dashboardController.js` | Master dashboard overview aggregator |
| **Frontend** | `src/components/WardRiskMapCard.jsx` | GIS ward risk visualization |
| **Frontend** | `src/components/GISMap.jsx` | Interactive infrastructure & heat zone map |

---

## 4. Safe Integration Points

To add live/historical Indian meteorological data, India-wide geographic coverage, and official health data provenance without breaking existing components, we establish non-intrusive integration adapters:

1. **Weather Ingestion Layer (`data-ingestion/weather/`):**
   * Plugs into the existing backend as a provider adapter interface. Normalizes IMD, Open-Meteo, and climatological feeds to a standardized schema before passing to `mlForecastService.js` and `weatherSyncService.js`.
2. **India-Wide Spatial Registry (`data-ingestion/locations/`):**
   * Provides verified coordinates, state, district, and demographic profiles for 40+ Indian major cities and districts across all climate zones.
3. **Historical Data Pipelines (`data-ingestion/historical_weather/` & `data-ingestion/health/`):**
   * Completely isolated offline pipelines. Ingests raw and processed datasets, records provenance metadata, and evaluates suitability without altering real-time prediction behavior.
4. **Data Provenance Annotations (`backend/src/models/` & `backend/src/services/`):**
   * Adds optional provenance metadata (`weather_source`, `health_data_status`, `model_version`, `health_data_source`) to existing prediction models and responses without breaking backward compatibility.
5. **Data Status Visualization in Frontend:**
   * Displays clear badges (`Weather: LIVE`, `Health Data: UNAVAILABLE / HISTORICAL / VALIDATED_TRAINING_DATA`) and labels health scores explicitly as `"Model-estimated risk"`.

---

## 5. New Modules and Files to Be Created

```
data-ingestion/
├── weather/
│   ├── schemas/
│   │   └── weather_schema.js
│   ├── validation/
│   │   └── weather_validator.js
│   ├── providers/
│   │   ├── imd_provider.js
│   │   ├── open_meteo_provider.js
│   │   └── climatological_fallback_provider.js
│   └── service/
│       └── weather_ingestion_service.js
├── locations/
│   ├── india_locations_registry.js
│   └── location_validator.js
├── historical_weather/
│   ├── historical_weather_pipeline.js
│   └── historical_weather_validator.js
└── health/
    ├── health_dataset_schema.js
    ├── health_data_validator.js
    └── health_data_ingestion_pipeline.js

backend/src/models/
├── WeatherObservation.js
├── WeatherForecastRecord.js
├── HealthObservation.js
└── DatasetMetadata.js

docs/
├── DATA_INTEGRATION_AUDIT.md      <── (This Document)
├── HEALTH_DATA_SOURCES.md         <── (Official Health Data Catalog)
└── DATA_INTEGRATION_REPORT.md     <── (Final Implementation & Verification Report)
```

This ensures full additive separation: existing working features remain undisturbed while production data ingestion and provenance are layered cleanly.
