# 🏛️ Architecture Audit & ML Integration Strategy
**Project:** ThermoGuard — Extreme Heatwave Early Warning and Human Thermal Stress Index  
**Audit Date:** Summer 2026  
**Document Target:** `docs/ML_INTEGRATION_AUDIT.md`  

---

## 1. Executive Summary

A comprehensive architectural inspection of the ThermoGuard repository was conducted across the active `backend` branch, remote branches (`frontend`, `ui-prototype`, `main`), configuration schemas, data pipelines, security layers, and test suites.

The existing backend is a **modular, resilient Express/Node.js CommonJS REST API** with established domain services for thermodynamic computations (WBGT, UTCI, Heat Index, IMD warning classifications, NDMA Action Plan directives) and an active fallback layer supporting offline/resilient hackathon and disaster scenarios. The frontend is a **React 19 + Vite 8 single-page application** leveraging Leaflet GIS maps and GSAP animations.

This document identifies the system architecture and specifies **fail-safe, zero-breakage integration points** for a Python ML service.

---

## 2. Comprehensive Repository Architecture Audit

### 2.1. Frontend Framework
* **Core Framework:** **React 19** (`react: ^19.2.8`, `react-dom: ^19.2.8`) bundled with **Vite 8** (`vite: ^8.2.2`, `@vitejs/plugin-react: ^6.1.0`).
* **Branch Isolation:** Located on branch `origin/frontend` (inspected via Git tree without branch switching).
* **Styling & UI Architecture:**
  * Component-scoped Vanilla CSS + `styled-components: ^6.5.3`.
  * Modern Dark-themed Glassmorphism & High-contrast Alert palettes (IMD Red/Orange/Yellow/Green standard color tokens).
  * Lucide Icons (`lucide-react: ^1.34.0`).
  * Micro-animations & interactive transitions via GSAP (`gsap: ^3.15.0`, `@gsap/react: ^2.1.2`).
* **Data Visualization & GIS:**
  * Charts: `recharts: ^3.10.1` for 24-hour diurnal heat curves and historical mortality trends.
  * Geospatial / Maps: Leaflet (`leaflet: ^1.9.4`) with `react-leaflet: ^5.0.0` in `GISMap.jsx` and `WardRiskMapCard.jsx`.
* **Linting:** `oxlint: ^1.79.0`.

---

### 2.2. Backend Framework
* **Framework:** **Express 4.21** (`express: ^4.21.2`) on **Node.js** (CommonJS module system: `"type": "commonjs"`).
* **Server Wrapper:** Native Node.js `http.createServer(app)` pattern facilitating clean lifecycle hooks, connection timeouts, and future WebSocket/streaming expansion.
* **Key Dependencies:** `mongoose: ^8.9.5`, `jsonwebtoken: ^9.0.2`, `bcryptjs: ^2.4.3`, `cors: ^2.8.5`, `helmet: ^8.0.0`, `dotenv: ^16.4.7`, `morgan: ^1.10.0`.

---

### 2.3. Backend Entry Point
* **Entry File:** `backend/server.js`
* **Startup Sequence:**
  1. Loads configuration from `backend/src/config/env.js`.
  2. Initializes MongoDB connection via `backend/src/config/db.js` (`connectDB()` with resilient error handling).
  3. Binds HTTP listener to `http://localhost:${PORT}` (Default port: `5000`).
  4. Graceful Shutdown: Listens to `SIGTERM` and `SIGINT` to safely drain open connections before process exit.
* **Application Factory:** `backend/src/app.js` builds middleware pipeline, security headers (`helmet`), permissive hackathon CORS, JSON parser (10MB limit), root `/` metadata route, `/api/health`, route mounting, and global error handlers.

---

### 2.4. Existing API Routes, Controllers & Services

```
backend/src/
├── routes/
│   ├── authRoutes.js            ──> /api/auth
│   ├── userRoutes.js            ──> /api/users
│   ├── weatherRoutes.js         ──> /api/weather
│   ├── forecastRoutes.js        ──> /api/forecasts
│   ├── thermalStressRoutes.js   ──> /api/thermal-stress
│   ├── riskRoutes.js            ──> /api/risk
│   ├── alertRoutes.js           ──> /api/alerts
│   ├── locationRoutes.js        ──> /api/locations
│   └── dashboardRoutes.js       ──> /api/dashboard
├── controllers/
│   ├── alertController.js        ──> JWT auth, SMS OTP simulation, quick role switch
│   ├── userController.js        ──> User profile & preference management
│   ├── weatherController.js     ──> Real-time Open-Meteo & synthetic observations
│   ├── forecastController.js    ──> 3-7 day biometeorological forecast slices
│   ├── thermalStressController.js─> On-the-fly thermodynamic calculation engine
│   ├── riskController.js        ──> Vulnerability assessment & NDMA directives
│   ├── alertController.js       ──> Active alerts, multi-lingual SMS, broadcast sim
│   ├── locationController.js    ──> Curated Indian hotspots, wards, emergency assets
│   └── dashboardController.js   ──> Master aggregated dashboard payload
└── services/
    ├── thermalCalculationService.js ──> Core mathematical & biometeorological formulas
    ├── weatherSyncService.js        ──> Open-Meteo sync & Summer 2026 synthetic generator
    ├── recommendationService.js     ──> Sector-wise NDMA Heat Action Plan actions
    └── alertEngineService.js        ──> Multi-lingual SMS/WhatsApp warning templates
```

#### Detailed Endpoint Inventory:

| Route Path | Method | Auth / RBAC | Purpose | Primary Service / Logic |
| :--- | :---: | :---: | :--- | :--- |
| `/` | `GET` | Public | System status, metadata, DB connection flag | `app.js` |
| `/api/health` | `GET` | Public | Health check (uptime, memory, DB status) | `app.js` |
| `/api/auth/register` | `POST` | Public (Validated) | Create citizen/authority account | `authController.js` |
| `/api/auth/login` | `POST` | Public (Validated) | Login with email/officerId & password | `authController.js` |
| `/api/auth/quick-login` | `POST` | Public | Instant 1-click login for demo personas | `authController.js` |
| `/api/auth/send-otp` | `POST` | Public | Mock SMS OTP transmission to citizen phone | `authController.js` |
| `/api/auth/verify-otp` | `POST` | Public | Validate OTP and issue citizen JWT | `authController.js` |
| `/api/auth/me` | `GET` | `verifyToken` | Authenticated profile inspection | `authController.js` |
| `/api/users/profile` | `GET/PUT` | `verifyToken` | Read/Update user preferences | `userController.js` |
| `/api/users` | `GET` | `requireRole('authority','admin')` | Administrative user roster | `userController.js` |
| `/api/weather/live` | `GET` | Public | Real-time weather + calculated WBGT/UTCI | `weatherSyncService.js` |
| `/api/weather/hourly` | `GET` | Public | 24-Hour diurnal heat curve & peak hours | `weatherSyncService.js` |
| `/api/weather/sync` | `POST` | Public | Trigger immediate location re-sync | `weatherSyncService.js` |
| `/api/forecasts` | `GET` | Public | 3 to 7-Day biometeorological forecast | `weatherSyncService.js` |
| `/api/forecasts/location/:id` | `GET` | Public | Location-specific multi-day forecast | `weatherSyncService.js` |
| `/api/thermal-stress/current` | `GET` | Public | Instant biometeorological metrics | `weatherSyncService.js` |
| `/api/thermal-stress/calculate`| `POST` | Public (Validated) | Scientific calculation of WBGT/UTCI/HI | `thermalCalculationService.js` |
| `/api/risk/mortality` | `GET` | Public | Multi-parametric mortality risk index | `riskController.js` |
| `/api/risk/historical` | `GET` | Public | 2019-2026 historical heatwave mortality | `seedData.js` |
| `/api/risk/recommendations` | `GET` | Public | NDMA Action Plan sector-wise directives | `recommendationService.js` |
| `/api/alerts` | `GET/POST`| GET: Public / POST: `authority/admin` | List active alerts or issue new bulletin | `alertController.js` |
| `/api/alerts/sms-templates` | `GET` | Public | Multi-lingual emergency broadcast templates | `alertEngineService.js` |
| `/api/alerts/location/:id` | `GET` | Public | Active alerts filtered by district | `alertController.js` |
| `/api/alerts/broadcast` | `POST` | `requireRole('authority','admin')` | Simulate SMS/WhatsApp emergency dispatch | `alertController.js` |
| `/api/locations` | `GET` | Public | 40+ curated Indian cities with metadata | `locationController.js` |
| `/api/locations/hotspots` | `GET` | Public | High-risk heatwave hotspot districts | `locationController.js` |
| `/api/locations/:id` | `GET` | Public | Location details by ID or code | `locationController.js` |
| `/api/locations/:id/wards` | `GET` | Public | Microclimate ward zones with UHI delta | `seedData.js` |
| `/api/locations/:id/emergency`| `GET` | Public | Hospitals, cooling shelters, water kiosks | `seedData.js` |
| `/api/dashboard/overview` | `GET` | Public | Complete master dashboard aggregation | `dashboardController.js` |
| `/api/dashboard/zone-risk` | `GET` | Public | Ward-level GIS heat intensity grid | `dashboardController.js` |
| `/api/dashboard/statistics` | `GET` | Public | National heat spell statistics & metrics | `dashboardController.js` |

---

### 2.5. MongoDB Connection & Models
* **Connection Layer:** `backend/src/config/db.js`
  * Mongoose 8 (`mongoose.connect(config.mongodbUri)`) with `serverSelectionTimeoutMS: 3000` and `connectTimeoutMS: 3000`.
  * `bufferCommands: false` prevents queries from hanging if MongoDB is offline; controllers automatically switch to in-memory fallback datasets.
* **Models (`backend/src/models/`):**
  1. `User.js`: User schema with bcrypt pre-save password hashing, JWT generator method, RBAC roles (`authority`, `citizen`, `admin`), and public JSON serializer.
  2. `Location.js`: Indian administrative districts with coordinates (`lat`, `lon`), population, hotspot flag, and regional heat thresholds (`plainsMaxTemp`, `coastalMaxTemp`, `hillsMaxTemp`, `wbgtDanger`, `wbgtLethal`).
  3. `Alert.js`: Early warning bulletin with severity (`Extreme`, `Severe`, `Moderate`), IMD 4-tier alert level (`RED`, `ORANGE`, `YELLOW`, `GREEN`), multi-district targeting, and expiration timestamps.
  4. `WeatherData.js`: Observation record containing ambient temp, humidity, feelsLike, dewPoint, wind speed/direction, solar irradiance (DNI/diffuse/shortwave), UV index, and weather condition codes.
  5. `ThermalStress.js`: Thermodynamic computation records storing Heat Index, WBGT, UTCI, mortality risk percentage, and stress classification.
  6. `Forecast.js`: 7-Day daily forecast projection array.
  7. `Ward.js`: Sub-district microclimate zone with Urban Heat Island (UHI) temperature offsets, demographic exposure, and emergency asset counters.
  8. `EmergencyResource.js`: Geospatial emergency amenities (`hospital`, `shelter`, `water`) with ICU capacity and contact links.
  9. `HealthRiskData.js`: Vulnerability breakdown (elderly, children, outdoor labourers, slum dwellers) with attached NDMA guidelines.

---

### 2.6. Environment Variable System
* **Configuration Module:** `backend/src/config/env.js` parses variables using `dotenv` from `backend/.env`.
* **Configured Variables (`.env.example`):**
  * `PORT`: Server listening port (default `5000`).
  * `NODE_ENV`: `development` | `production` | `test` (default `development`).
  * `MONGODB_URI`: MongoDB connection string (default `mongodb://127.0.0.1:27017/thermoguard`).
  * `JWT_SECRET`: Secret key for JWT signing with fallback.
  * `JWT_EXPIRES_IN`: Expiry string (default `7d`).
  * `CORS_ORIGIN`: Comma-separated allowed origins (default `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173`).
  * `OPEN_METEO_API_URL`: Meteorological endpoint (default `https://api.open-meteo.com/v1/forecast`).
  * `METEO_TIMEOUT_MS`: Network timeout for meteorological calls (default `5000`).
  * `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`: Security rate limiting values.

---

### 2.7. Authentication & Security Middleware
* **Middleware Files:** `backend/src/middleware/`
  * `authMiddleware.js`:
    * `verifyToken`: Validates Bearer token or `x-access-token`. Queries MongoDB or constructs decoded stateless token payload.
    * `requireRole(...roles)`: Enforces RBAC permissions (`authority`, `admin`, `citizen`).
    * `optionalAuth`: Soft authentication enabling personalized responses without rejecting guests.
  * `validationMiddleware.js`:
    * Validates schemas for registration, login, thermal calculation requests, and emergency alert creation.
* **Security Headers:** Helmet (`app.use(helmet({ crossOriginResourcePolicy: false }))`).
* **CORS:** Flexible origin handler supporting local Vite dev server, custom ports, and curl/server-to-server calls without credentials rejection.

---

### 2.8. Weather & API Integrations
* **External Provider:** Open-Meteo High-Resolution Forecast API (`https://api.open-meteo.com/v1/forecast`).
* **Data Ingested:** `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `dew_point_2m`, `surface_pressure`, `wind_speed_10m`, `wind_direction_10m`, `direct_normal_irradiance`, `diffuse_radiation`, `shortwave_radiation`, `uv_index`, `cloud_cover`, `weather_code`, plus 7-day daily max/min and 24-hr hourly sequences.
* **Resilience Mechanism:** Integrated `AbortController` timeout (5000ms). If the external API fails or network is unavailable, `weatherSyncService.js` automatically synthesizes climatologically calibrated Summer 2026 data for Northwest, Central, and Coastal Indian climate zones.
* **Thermodynamic Service:** `thermalCalculationService.js` implements:
  * Magnus-Tetens formula for Dew Point (°C).
  * Rothfusz Regression equation with high/low humidity adjustments for Heat Index (°C).
  * Liljegren & Stull wet-bulb globe temperature approximation (WBGT °C).
  * 6th-order polynomial Universal Thermal Climate Index (UTCI °C).
  * Multi-parametric heatwave mortality risk percentage ($0-99\%$).
  * IMD 4-tier warning level classifier with terrain adjustment ($>30.5^\circ\text{N}$ hills vs plains).

---

### 2.9. GIS & Map Functionality
* **Frontend GIS:** Leaflet & React-Leaflet (`react-leaflet: ^5.0.0`) rendering OpenStreetMap tiles, interactive heat markers, ward risk boundaries, and emergency facility popups.
* **Backend Geospatial Indexing:** Compound coordinate indices `{ 'coordinates.lat': 1, 'coordinates.lon': 1 }` on `Location`, `Ward`, and `EmergencyResource`.
* **Microclimate Urban Heat Island (UHI) Generator:** Dynamic ward generator modeling urban heat sink and thermal buildup differentials ($+0.8^\circ\text{C}$ to $+2.4^\circ\text{C}$).

---

### 2.10. Complete Repository Folder Structure

```
extreme-heat-wave-early-warning/
├── .git/
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── scripts/
│   │   ├── seed.js
│   │   └── testApi.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       ├── controllers/
│       │   ├── alertController.js
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── forecastController.js
│       │   ├── locationController.js
│       │   ├── riskController.js
│       │   ├── thermalStressController.js
│       │   ├── userController.js
│       │   └── weatherController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── validationMiddleware.js
│       ├── models/
│       │   ├── Alert.js
│       │   ├── EmergencyResource.js
│       │   ├── Forecast.js
│       │   ├── HealthRiskData.js
│       │   ├── Location.js
│       │   ├── ThermalStress.js
│       │   ├── User.js
│       │   ├── Ward.js
│       │   └── WeatherData.js
│       ├── routes/
│       │   ├── alertRoutes.js
│       │   ├── authRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── forecastRoutes.js
│       │   ├── locationRoutes.js
│       │   ├── riskRoutes.js
│       │   ├── thermalStressRoutes.js
│       │   ├── userRoutes.js
│       │   └── weatherRoutes.js
│       ├── services/
│       │   ├── alertEngineService.js
│       │   ├── recommendationService.js
│       │   ├── thermalCalculationService.js
│       │   └── weatherSyncService.js
│       └── utils/
│           ├── logger.js
│           ├── responseFormatter.js
│           └── seedData.js
└── docs/                               <── [New Documentation Hub]
    └── ML_INTEGRATION_AUDIT.md         <── [This File]
```

---

### 2.11. Package Manager & Scripts

#### Backend (`backend/package.json`):
* **Package Manager:** `npm` (CommonJS)
* **Scripts:**
  * `npm start`: `node server.js` (Production startup)
  * `npm run dev`: `node --watch server.js` (Development watcher on Node 18+)
  * `npm run seed`: `node scripts/seed.js` (Populates MongoDB with curated users, 40+ Indian cities, wards, resources, and alerts)
  * `npm test`: `node scripts/testApi.js` (Automated API test runner)

#### Frontend (`frontend` branch):
* **Package Manager:** `npm` (ESM)
* **Scripts:**
  * `npm run dev`: `vite`
  * `npm run build`: `vite build`
  * `npm run lint`: `oxlint`
  * `npm run preview`: `vite preview`

---

### 2.12. Existing Tests
* **Test Suite:** `backend/scripts/testApi.js`
* **Coverage:** Custom automated end-to-end integration test runner containing **18 test cases** covering:
  1. Root `/` and `/api/health` validation
  2. Authentication pipeline (quick login, register, credential login, mobile OTP send/verify, token verification, route protection)
  3. Weather routes (live, hourly 24h curve)
  4. 7-day multi-parametric forecast validation
  5. Thermal stress calculation endpoint
  6. Mortality risk, historical trends, and NDMA recommendations
  7. Emergency alert listing, multi-lingual templates, and broadcast simulation
  8. Curated location queries, hotspots, wards, and emergency facilities
  9. Aggregated dashboard master payload integrity

---

### 2.13. Error Handling & Logging
* **Error Handling:** `backend/src/middleware/errorMiddleware.js`
  * `notFoundHandler`: Standardized 404 response for unmatched routes.
  * `errorHandler`: Intercepts unhandled errors, formatting them via `responseFormatter.js`. Handles Mongoose `CastError` (404), `ValidationError` (400), MongoDB Duplicate Key `11000` (400), and JWT `JsonWebTokenError` / `TokenExpiredError` (401).
* **Logging:**
  * HTTP Logging: `morgan('dev')` mounted in `app.js` (skipped in `NODE_ENV === 'test'`).
  * Custom Structured Logger: `backend/src/utils/logger.js` supporting `logger.info`, `logger.warn`, `logger.error`, and `logger.debug` with ISO timestamps.

---

## 3. Python ML Service Safest Integration Architecture

To integrate machine learning capabilities (e.g. Extreme Heatwave Nowcasting, Urban Heat Island satellite downscaling, Spatiotemporal Mortality Risk prediction, or LLM-driven multi-lingual advisory generation), the architecture must strictly obey the following guardrails:

```
                                  ┌───────────────────────────────┐
                                  │      React 19 Frontend        │
                                  │ (Vite :5173 / Leaflet / GSAP) │
                                  └───────────────┬───────────────┘
                                                  │ HTTP / JSON
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │     Node.js Express API       │
                                  │         (:5000)               │
                                  └───────┬───────────────┬───────┘
                                          │               │
                  Fast Fallback / Cache   │               │ HTTP REST (Circuit Breaker)
                                          ▼               ▼
                       ┌─────────────────────┐   ┌───────────────────────────────┐
                       │  Existing Domain    │   │      Python ML Service        │
                       │  Services & Mongo   │   │  (FastAPI / Uvicorn :8000)    │
                       │ (ThermalCalcEngine) │   │ (XGBoost / PyTorch / LightGBM)│
                       └─────────────────────┘   └───────────────────────────────┘
```

### 3.1. Recommended Architectural Pattern: Sidecar Microservice via HTTP / REST
* **Pattern:** A lightweight **FastAPI** Python microservice running on a separate port (e.g., `8000`).
* **Adapter Layer in Express:** Add a single client adapter service `backend/src/services/mlClientService.js` inside the Express backend.
* **Single Gateway:** Frontend continues communicating exclusively with the Node.js API. The Node API delegates ML tasks to the Python service when available.
* **Why this is safest:**
  * **Zero Breaking Changes:** Existing API contracts for `/api/thermal-stress`, `/api/forecasts`, `/api/risk`, and `/api/dashboard/overview` remain unchanged.
  * **No Network Requests During App Startup:** The Node backend starts instantly without waiting for Python or ML model weights to initialize.
  * **Graceful Degradation:** If the Python ML service is offline, cold-starting, or times out, the Express backend falls back transparently to `thermalCalculationService.js`.
  * **Memory Isolation:** Heavy Python scientific libraries (`numpy`, `scipy`, `pandas`, `torch`, `xgboost`, `scikit-learn`) execute in Python's runtime without blocking Node's event loop.

---

### 3.2. Identified Safe Integration Points

| Integration Area | Existing Node Component | Proposed ML Extension | Safest Integration Point | Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **1. Heatwave Nowcasting & Multi-Day Forecast** | `backend/src/services/weatherSyncService.js` | Time-series AI model (LSTM/PatchTST/XGBoost) for 7-day temperature/humidity anomaly forecasting. | Call Python endpoint `POST /ml/predict/forecast` from `weatherSyncService.js` or `forecastController.js`. | If ML service fails, default to Open-Meteo numerical forecast or Summer 2026 Climatological Model. |
| **2. Microclimate & Ward-Level UHI Estimation** | `backend/src/utils/seedData.js` (`generateWardsForLocation`) | Spatial regression downscaling using satellite LST (Land Surface Temp) & NDVI indices. | Call Python endpoint `POST /ml/predict/uhi-grid` in `locationController.js` (`getWardsForLocation`). | Default to built-in mathematical UHI microclimate variance generator. |
| **3. Mortality & Excess Vulnerability Risk** | `backend/src/services/thermalCalculationService.js` (`calculateMortalityRisk`) | Multi-variable health risk model incorporating demographic vulnerability, consecutive hot night spells, and humidity. | Delegate in `riskController.js` to `POST /ml/predict/mortality-risk`. | Fall back to NDMA/IMD multi-parametric formula in `thermalCalculationService.js`. |
| **4. AI Heat Advisory & Multi-lingual Alerts** | `backend/src/services/alertEngineService.js` | Contextual LLM alert synthesizer generating vernacular advisories tailored to vulnerable cohorts. | Add `POST /api/alerts/generate-advisory` routing to Python `POST /ml/advisory/generate`. | Fall back to pre-compiled `MULTILINGUAL_SMS_TEMPLATES`. |

---

### 3.3. Configuration & Secret Management Rules
* Add environment variables to `backend/.env.example` and `backend/src/config/env.js`:
  ```javascript
  // ML Service Configuration
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  ML_SERVICE_TIMEOUT_MS: parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10) || 3000,
  ML_SERVICE_ENABLED: process.env.ML_SERVICE_ENABLED === 'true' || false,
  ```
* **No hardcoded URLs or keys:** All Python service endpoints and API tokens must be read exclusively from environment variables.

---

### 3.4. Guardrail Compliance Verification Checklist
* [x] **Preserve Current Architecture:** Express + React 19 architecture is completely maintained; no existing routes modified or deleted.
* [x] **No Code Replacement:** Existing scientific algorithms (`calculateWBGT`, `calculateUTCI`, etc.) are preserved as verified fallback baseline engines.
* [x] **No Functionality Duplication:** Python handles heavy model inference; Node handles auth, validation, caching, DB persistence, and API orchestration.
* [x] **No Unnecessary Dependencies:** Node backend requires only standard HTTP `fetch` (native in Node 18+) with `AbortController` timeout to connect to Python.
* [x] **No Startup Blocking:** No synchronous health checks or model loads block `server.listen()` in `server.js`.
* [x] **No Recursive Background Loops:** Python service is on-demand or event-driven; no unbounded loops or uncontrolled scheduling tasks introduced.

---

## 4. Next Steps for Implementation

1. **Python Service Directory:** Create isolated `ml-service/` containing `requirements.txt`, `main.py` (FastAPI), and model pipelines.
2. **Node Service Adapter:** Create `backend/src/services/mlClientService.js` implementing timeout-guarded HTTP queries with automatic fallback.
3. **Controller Hooks:** Wire optional ML enhancements into `riskController.js` and `locationController.js`.
4. **Validation:** Run `npm test` in `backend` to ensure 100% existing test pass rate remains unaffected.
