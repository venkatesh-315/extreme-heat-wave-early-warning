# ThermoGuard Real Data Ingestion & Data-Provenance Comprehensive Report

**Document Version:** 1.0.0  
**Implementation Date:** August 31, 2026  
**System Status:** **ALL 14 PHASES COMPLETE & VERIFIED**  
**Test Pass Rate:** **100% (18/18 Data Integration Tests, 34/34 Backend API Tests, 48/48 Python ML Tests)**

---

## 1. Executive Summary & Architectural Integrity

The ThermoGuard real data ingestion layer provides a secure, reliable, and scientifically calibrated ingestion envelope around the existing biometeorological architecture. 

### Core Architectural Guarantees Enforced:
1. **Zero Breaking Changes:** Existing frontend dashboards, Leaflet GIS layers, backend Express routing, MongoDB connections, and FastAPI XGBoost inference services were preserved without regressions.
2. **Strict Geographic Preference (India-Wide):** Calibrated exclusively for Indian subcontinental meteorology across all IMD climate zones (Northwest Plains, Central Heat Core, Gangetic Basin, Coastal Compound Humid Belts, and Southern Plateau).
3. **Epidemiological Integrity & No Fabricated Data:** Official Indian statistical realities are strictly respected. The system explicitly discloses that no real-time mortality API exists and labels output as `"Model-estimated risk"`.
4. **Resilience & Graceful Failover:** Multi-tier failover chains ensure continuous operation with zero unbounded retries, zero recursive scheduling, and bounded in-memory fallbacks during outages.

```mermaid
flowchart TD
    subgraph SENSORS_AND_FEEDS["Meteorological Feeds"]
        IMD["IMD Direct Gateway (AWS/Gridded)"]
        METEO["Open-Meteo High-Res Grid (0.1° WMO)"]
        CLIM["Indian Climatological Baseline (Zero-Network)"]
    end

    subgraph INGESTION_LAYER["Data Ingestion & Validation"]
        WVAL["Weather Physical Bounds Validator"]
        LOC_REG["Controlled India Spatial Registry (40+ Cities)"]
        LOC_VAL["Bounded Location Chunk Iterator"]
    end

    subgraph EXISTING_CORE["Existing Frozen Core Platform"]
        THERMAL["WBGT / UTCI / Heat Index Physics"]
        FEAT["25-Feature Schema Transformer"]
        XGB["XGBoost Dual-Target Regressors"]
        RISK_ENG["Deterministic Risk Decision Engine"]
        MONGO["MongoDB Resilient Persistence Store"]
        GIS["Leaflet GIS & Dashboard UI"]
    end

    subgraph HEALTH_GOVERNANCE["Health Provenance Layer (Offline)"]
        IDSP["IDSP Weekly Heat Surveillance"]
        NDMA["NDMA State HAP Forensic Reports"]
        HVAL["Epidemiological Target Validator"]
        CAND["Offline Candidate Retraining (models/candidates/)"]
    end

    IMD -->|HTTPS / 5s Timeout| WVAL
    METEO -->|HTTPS / Max 2 Retries| WVAL
    CLIM -.->|Fallback| WVAL
    WVAL --> LOC_VAL
    LOC_REG --> LOC_VAL
    LOC_VAL --> THERMAL
    THERMAL --> FEAT
    FEAT --> XGB
    XGB --> RISK_ENG
    RISK_ENG --> MONGO
    RISK_ENG --> GIS

    IDSP --> HVAL
    NDMA --> HVAL
    HVAL --> CAND
```

---

## 2. Weather Source Integration & Multi-Tier Failover

| Tier | Provider Identifier | Adapter Module | Latency / Timeout | Failover Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Official)** | `IMD_NATIONAL` | `data-ingestion/weather/providers/imd_provider.js` | 5000 ms | Credentials unconfigured or endpoint unavailable |
| **Tier 2 (Primary Grid)** | `OPEN_METEO_GRID` | `data-ingestion/weather/providers/open_meteo_provider.js` | 5000 ms (Max 2 Retries) | Upstream network timeout / HTTP 5xx |
| **Tier 3 (Air-Gapped)** | `CLIMATOLOGICAL_MODEL` | `data-ingestion/weather/providers/climatological_fallback_provider.js` | < 1 ms (Deterministic) | Total external connectivity loss |

### Physical Boundary Validation Enforced (`weather_validator.js`):
- Latitude: $[-90.0, +90.0]$ | Longitude: $[-180.0, +180.0]$
- Temperature: $[-30.0^\circ\text{C}, +65.0^\circ\text{C}]$
- Relative Humidity: $[0.0\%, 100.0\%]$
- Wind Speed: $[0.0\text{ m/s}, 100.0\text{ m/s}]$
- Surface Pressure: $[750.0\text{ hPa}, 1150.0\text{ hPa}]$
- Solar Radiation: $[0.0\text{ W/m}^2, 1600.0\text{ W/m}^2]$
- Strict rejection of `NaN`, `Infinity`, undefined, and malformed types.

---

## 3. Spatial Coverage & Location Registry

The platform maintains a controlled spatial registry (`india_locations_registry.js`) covering over 40 Indian metropolitan centers, state capitals, and vulnerable districts.

### Key Monitored Locations:
- **Delhi NCR:** New Delhi (Safdarjung, Palam, Najafgarh, Ridge)
- **Northwest & Arid Thar:** Jaipur, Jodhpur, Bikaner, Churu, Ludhiana
- **Western & Coastal:** Ahmedabad, Surat, Mumbai, Nagpur (Vidarbha), Pune
- **Central & Gangetic Basin:** Bhopal, Gwalior, Lucknow, Prayagraj, Varanasi, Patna, Gaya
- **Deccan & Southern Plateau:** Hyderabad, Vijayawada, Bengaluru, Chennai, Kochi
- **Eastern Coastal Hotspots:** Kolkata, Bhubaneswar, Titlagarh (Furnace City)

Batch execution across locations is governed by `processLocationBatch` in chunks of 4–5 locations, preventing uncontrolled request fan-out or recursive scheduling.

---

## 4. Health Data Governance & Target Suitability

### Catalog of Evaluated Official Sources (`docs/HEALTH_DATA_SOURCES.md`):
1. **IDSP (NCDC / MoHFW):** Weekly confirmed/suspected heatstroke hospital cases $\rightarrow$ **`SUITABLE_FOR_CALIBRATION`**
2. **NDMA / State Disaster Management Authorities:** Forensic heat casualty audit reports $\rightarrow$ **`SUITABLE_FOR_CALIBRATION`**
3. **Sample Registration System (SRS / MCCD):** Annual all-cause mortality statistics $\rightarrow$ **`NOT_SUITABLE_FOR_TARGET`** (insufficient daily resolution)
4. **National Health Mission (HMIS):** Monthly facility admissions $\rightarrow$ **`NOT_SUITABLE_FOR_TARGET`** (lacks heat illness etiology)

### Provenance State Codes in UI & APIs:
- `health_data_status = "UNAVAILABLE"`: Live real-time health data is absent; UI indicates model-estimated physiological risk.
- `health_data_status = "HISTORICAL"`: Retrospective official government data used in research views.
- `health_data_status = "VALIDATED_TRAINING_DATA"`: Retrospective datasets certified for model risk calibration.

---

## 5. Database Architecture & Additive Models

Four dedicated Mongoose schemas support offline data aggregation and live forecast logging without altering existing collections:

1. **`WeatherObservation` (`weather_observations`):** Stores real-time station/grid observations with compound unique index on `{ location_id: 1, timestamp: 1 }`.
2. **`WeatherForecastRecord` (`weather_forecasts`):** Stores multi-day horizon forecasts with index on `{ location_id: 1, forecast_timestamp: 1, target_date: 1, provider: 1 }`.
3. **`HealthObservation` (`health_observations`):** Stores validated epidemiological records with index on `{ location_id: 1, date: 1, target_definition: 1, dataset_name: 1 }`.
4. **`DatasetMetadata` (`dataset_metadata`):** Stores dataset provenance, licensing, and suitability audits with index on `{ dataset_name: 1, version: 1 }`.

---

## 6. Model Retraining Governance & Candidate Isolation

Production models (`models/mortality_model.joblib`, `models/hospitalization_model.joblib`) are protected and cannot be automatically replaced by background jobs.

- **Candidate Retraining (`train_candidate_model.py`):** Trains candidate regressors exclusively into `models/candidates/` with versioned metadata (`metadata_candidate_v*.json`).
- **Promotion Governance:** Production deployment requires manual administrative review, metric verification, and explicit artifact promotion.

---

## 7. Verification Test Results Matrix

### Suite 1: 18-Point Data Integration Suite (`testDataIngestionIntegration.js`)
| Scenario ID | Test Description | Result | Details |
| :--- | :--- | :--- | :--- |
| **P01** | Live Weather Request via Ingestion Adapter | **PASSED** | Open-Meteo High-Resolution Grid feed validated |
| **P02** | Malformed Weather Response Interception | **PASSED** | Rejection of non-numeric and out-of-bounds coordinates |
| **P03** | Weather Timeout / Outage Fallback | **PASSED** | Immediate failover to Climatological Baseline model |
| **P04** | Weather Provider Failure Resilience | **PASSED** | Graceful failover on corrupted upstream responses |
| **P05** | 3-Day Forecast Pipeline Execution | **PASSED** | 3 consecutive forecast days generated for `del-delhi` |
| **P06** | 5-Day Forecast Pipeline Execution | **PASSED** | 5 consecutive forecast days generated for `tel-hyderabad` |
| **P07** | Duplicate Forecast Deduplication | **PASSED** | Idempotent upsert on identical location + horizon slot |
| **P08** | ML Service Unavailable Fallback | **PASSED** | Deterministic biometeorological formula fallback |
| **P09** | MongoDB Disconnect Fallback | **PASSED** | Bounded in-memory sliding window store |
| **P10** | Missing / Null Health Dataset Guard | **PASSED** | Descriptive error on null payload |
| **P11** | Unsuitable Health Target Evaluator | **PASSED** | Flagged annual all-cause mortality as `NOT_SUITABLE_FOR_TARGET` |
| **P12** | Duplicate Health Records Deduplication | **PASSED** | Deduplicated identical date/target records |
| **P13** | Invalid Health Values Rejection | **PASSED** | Rejected negative counts and malformed dates |
| **P14** | India-Wide Location Bounded Chunks | **PASSED** | Processed 8 locations in sequential chunks of 4 |
| **P15** | Concurrent API Requests | **PASSED** | Handled simultaneous predictions without race conditions |
| **P16** | Unauthorized Request Protection | **PASSED** | HTTP 401 returned for unauthenticated protected endpoints |
| **P17** | Malformed JSON Request Interception | **PASSED** | HTTP 400 returned for broken syntax payloads |
| **P18** | Oversized Payload Protection | **PASSED** | HTTP 413 returned for 11MB payload |

### Suite 2: Express Backend API Suite (`npm test`)
- **Total Tests:** 34
- **Passed:** 34
- **Failed:** 0
- **Pass Rate:** **100%**

### Suite 3: Python ML XGBoost Suite (`python -m unittest`)
- **Total Tests:** 48
- **Passed:** 48
- **Failed:** 0
- **Pass Rate:** **100%**

### Suite 4: Frontend Production Build (`npm run build`)
- **Result:** **Success (0 errors)**
- **Output:** Production assets compiled in 1.41s to `dist/`.
