# ThermoGuard ML Integration Security & Reliability Audit Report

**Audit Date:** August 31, 2026  
**Audited Systems:** FastAPI ML Microservice, Express.js Backend Integration, MongoDB Persistence Layer, Meteorological Sync Pipelines, Frontend Dashboard & GIS Layer, Containerization (Docker)  
**Status:** **AUDITED & SECURED**  

---

## Executive Summary

A comprehensive security, reliability, and architectural audit was performed on the ThermoGuard Extreme Heatwave Early Warning and Human Thermal Stress ML integration. The audit evaluated attack surfaces, data integrity, denial-of-service vectors, deserialization safety, error handling, rate limiting, and persistence resilience.

Confirmed issues were addressed directly in code, and automated test suites (Python unit tests, Express backend API tests, 3-5 day forecasting test suite, security verification scripts, and frontend production builds) were executed to confirm zero regressions.

---

## Scope of Inspection

The audit evaluated 18 specific functional and security dimensions:

1. **FastAPI ML Microservice (`ml-service/app/`):**
   - In-memory rate limiting, payload byte-size caps, structured logging, middleware error trapping, request ID propagation.
2. **Backend ML Integration Bridge (`backend/src/services/mlClientService.js`):**
   - URL isolation, request timeouts (3000ms), bounded retries (max 2), circuit breaking (5 failures / 30s cooldown), schema validation, scientific formula fallback.
3. **MongoDB Persistence & Sanitization (`backend/src/services/mlPersistenceService.js`):**
   - Compound unique indexing, date normalization (UTC), regex identifier validation, NoSQL injection resistance, and bounded in-memory caching.
4. **Meteorological & Multi-Day Forecasting Pipeline (`backend/src/services/mlForecastService.js`):**
   - Deduplication of external weather requests, concurrency locks per location, isolated per-day failure containment, absence of recursive scheduling loops.
5. **Model Deserialization & File Access (`ml-service/app/model.py`):**
   - Static path confinement (`os.path.commonpath`), rejection of client-supplied model paths, joblib artifact integrity.
6. **Input & Output Validation (`ml-service/app/schemas.py` & `app/thermal.py`):**
   - Pydantic bounds, rejection of `NaN`, `Infinity`, negative humidity/solar radiation, physiological range constraints.
7. **Frontend API Consumption & React State (`src/`):**
   - Consumption strictly through backend proxy (`/api`), no client exposure of secrets or internal microservice endpoints, bounded `useEffect` dependency graphs.
8. **Containerization Security (`Dockerfile` & `docker-compose.yml`):**
   - Non-root user execution (`appuser` / `node`), explicit container port bindings, health checks, dependency isolation.

---

## Issues Identified & Remediations

| ID | Component | Severity | Description | Remediation Applied |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | `ml-service/app/main.py` | **Medium** | **Unbounded Rate-Limiter State:** The in-memory client IP history dictionary (`_ip_request_history`) accumulated IP keys indefinitely without eviction, posing a slow memory exhaustion risk under high unique-IP traffic. | Implemented automatic LRU-style eviction of stale/expired IP keys whenever the active history exceeds 5,000 entries. |
| **SEC-02** | `backend/src/services/mlPersistenceService.js` | **Medium** | **Unbounded In-Memory Fallback Cache:** The fallback store (`inMemoryPredictionStore`) used during offline or test mode had no upper capacity limit. | Capped store to `MAX_IN_MEMORY_PREDICTIONS = 1000` with oldest-key eviction on cache overflow. |
| **SEC-03** | `ml-service/app/model.py` | **Low** | **Hospitalization Risk Output Range Bound:** Hospitalization regression prediction clipped values at `max(0.0, pred)` without an upper ceiling constraint of `min(100.0, pred)`. | Enforced dual clamping `round(max(0.0, min(100.0, pred)), 1)` ensuring all risk scores strictly conform to $[0.0, 100.0]$. |
| **SEC-04** | `backend/Dockerfile` | **Medium** | **Missing Container Specification:** Backend lacked a standalone production Dockerfile with non-root security boundaries. | Created multi-stage `Dockerfile` utilizing `node:20-alpine`, `USER node`, production-only dependencies, and automated health checks. |
| **SEC-05** | `docker-compose.yml` | **Low** | **Missing Multi-Service Orchestration:** Root lacked unified orchestration with network boundaries and health dependency ordering. | Created `docker-compose.yml` defining `ml-service`, `backend`, and `mongodb` with internal network isolation and healthcheck dependencies. |

---

## Security Analysis Checklist

### 1. SSRF & Path Traversal
- **Status:** **VERIFIED PROTECTED**
- **Findings:** The ML microservice endpoint URL in Express backend is loaded strictly from environment configuration (`config.mlServiceUrl`). Dynamic user inputs (such as location code or weather metrics) are never concatenated into hostname or scheme positions. Model artifact loading in Python is confined to `Path(settings.model_dir).resolve()` with `os.path.commonpath` verification.

### 2. Code Execution & Insecure Deserialization
- **Status:** **VERIFIED PROTECTED**
- **Findings:** `joblib.load` is restricted exclusively to fixed filenames (`mortality_model.joblib`, `hospitalization_model.joblib`) stored in the application's local `models/` directory. No client uploads or user-supplied filepaths are deserialized or evaluated.

### 3. NoSQL Injection & Query Sanitization
- **Status:** **VERIFIED PROTECTED**
- **Findings:** All database filter parameters are strictly sanitized before reaching Mongoose queries:
  - `location_id` validated against regex `/^[a-z0-9_-]+$/`
  - `risk_level` validated against enum whitelist (`VERY_LOW`, `LOW`, `MODERATE`, `HIGH`, `EXTREME`)
  - Timestamps normalized to deterministic UTC `Date` objects
  - Pagination limits clamped between $1$ and $100$.

### 4. Denial of Service, Timeouts & Circuit Breaking
- **Status:** **VERIFIED PROTECTED**
- **Findings:**
  - Fast-failing payload size guards enforce a strict 1 MB ceiling on request bodies.
  - Rate limiting caps incoming traffic at 120 requests/minute per IP.
  - Express backend wraps outbound calls in `AbortController` with explicit 3000ms timeouts.
  - Exponential backoff retry is strictly bounded to max 2 attempts and never triggers on 4xx client errors.
  - Circuit breaker trips to OPEN after 5 consecutive failures, shielding both backend and Python microservice from cascading failure.

### 5. Sensitive Data & Secrets Exposure
- **Status:** **VERIFIED PROTECTED**
- **Findings:**
  - No database credentials, JWT secrets, or internal service URLs are bundled in client assets or logged in server output.
  - Global error handlers intercept unhandled exceptions and return sanitized generic JSON responses (`InternalServerError`) without exposing stack traces or filesystem paths to clients.

---

## Test & Verification Results

### 1. Backend Automated Integration Suite
- **Command:** `npm test` in `backend/`
- **Result:** **34 Passed | 0 Failed (100%)**
- **Key Suites Verified:**
  - Root info & health probe (`/api/health`)
  - Authentication (JWT & Citizen OTP)
  - Meteorological endpoints & Open-Meteo integration
  - Dedicated XGBoost ML inference (`POST /api/ml/predict`)
  - Idempotent prediction persistence & duplicate prevention
  - 3-day and 5-day ML forecasting pipelines
  - Master dashboard overview payload (`GET /api/dashboard/overview`)

### 2. Python ML Microservice Test Suite
- **Command:** `python -m unittest discover -s tests -p "test_*.py" -v` in `ml-service/`
- **Result:** **48 Passed | 0 Failed (100%)**
- **Key Suites Verified:**
  - Thermodynamic formulas (ISO 7933 WBGT, UTCI, Steadman Heat Index)
  - Canonical 25-feature schema extraction and chronological lag ordering
  - Input validation guardrails (rejection of `NaN`, `Infinity`, negative humidity, out-of-bounds temps)
  - XGBoost regressor inference and metadata integrity
  - Rate limiting middleware and payload size caps
  - Risk decision thresholds and NDMA action directive generation

### 3. Dedicated Security Audit & Health Verification
- **Command:** `node scripts/verifySecurityAndHealth.js` in `backend/`
- **Result:** **16 Passed | 0 Failed (100%)**

### 4. Dependency & Vulnerability Audit
- **Command:** `npm audit` in `backend/`
- **Result:** **0 Vulnerabilities found**

### 5. Frontend Production Bundle
- **Command:** `npm run build` in root
- **Result:** **Vite build succeeded in 1.30s (0 errors)**

---

## Remaining Risks & Operational Guidance

While all identified implementation vulnerabilities and stability bugs have been resolved, no complex software system is completely without risk. Operational teams should maintain awareness of the following items:

1. **Joblib Artifact Trust Boundary:**
   - *Risk:* `joblib` / `pickle` serialization format is fundamentally code-bearing.
   - *Mitigation in Place:* Models are loaded strictly from the local container filesystem, never from network requests or user uploads.
   - *Operational Recommendation:* Ensure CI/CD artifact registries sign and checksum model files (`mortality_model.joblib`) prior to container build.
2. **Third-Party Meteorological API Availability:**
   - *Risk:* Outages or rate limiting from upstream meteorological data providers (e.g. Open-Meteo) could delay real-time observations.
   - *Mitigation in Place:* Integrated climatological fallbacks and resilient caching ensure continuous dashboard rendering even when external weather streams are offline.
3. **In-Memory Rate Limiting in Multi-Replica Deployments:**
   - *Risk:* The current sliding-window rate limiter runs in-memory per FastAPI instance. If scaled horizontally across multiple container replicas without sticky sessions, effective rate limits will scale proportionally with replica count.
   - *Operational Recommendation:* For multi-node Kubernetes deployments, integrate a distributed Redis-backed rate limiter.
