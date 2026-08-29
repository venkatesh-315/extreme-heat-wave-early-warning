# 🔥 ThermoGuard Backend API Server
> **Extreme Heatwave Early Warning and Human Thermal Stress Index**  
> *Production-Ready REST API Architecture for Meteorological & Public Health Disaster Management*

---

## 📌 Overview

ThermoGuard Backend is a high-performance Node.js / Express / MongoDB REST API server providing real-time meteorological synchronization, biometeorological human thermal stress calculations (WBGT, UTCI, Heat Index), ward-level microclimate analysis, NDMA Heat Action Plan (HAP) public health directives, multi-lingual emergency dispatch, and JWT-authenticated disaster operations management.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JWT (`jsonwebtoken`) with `bcryptjs` password hashing & Role-Based Access Control (RBAC)
- **Security & Headers**: Helmet, CORS
- **Logging**: Morgan & Custom structured logger
- **Meteorological Integrations**: Open-Meteo High-Resolution Atmospheric Reanalysis + Summer 2026 Indian Climatology Model

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection with Mongoose & event listeners
│   │   └── env.js                # Environment config loader with validation & defaults
│   ├── models/
│   │   ├── User.js               # Authority, Citizen, Admin schemas + bcrypt + JWT
│   │   ├── Location.js           # Curated Indian cities, coordinates, population, hotspots
│   │   ├── WeatherData.js        # Meteorological readings (Temp, RH, Wind, Solar, Dewpoint)
│   │   ├── ThermalStress.js      # WBGT, UTCI, Heat Index, Mortality Risk, Stress categories
│   │   ├── Forecast.js           # 7-day high-resolution biometeorological forecast
│   │   ├── Ward.js               # Microclimate ward data with UHI differentials & facilities
│   │   ├── Alert.js              # IMD / NDMA Red/Orange/Yellow/Green heatwave alerts
│   │   ├── HealthRiskData.js     # NDMA action plan recommendations & vulnerability exposure
│   │   └── EmergencyResource.js  # Dedicated Heat ICUs, Cooling Shelters, Water Kiosks
│   ├── services/
│   │   ├── thermalCalculationService.js # Liljegren WBGT, UTCI, Rothfusz Heat Index, Mortality formulas
│   │   ├── weatherSyncService.js        # Open-Meteo live sync + Summer 2026 calibrated fallback
│   │   ├── recommendationService.js     # NDMA Heat Action Plan recommendation engine
│   │   └── alertEngineService.js        # Automated alert generation & SMS/WhatsApp dispatch templates
│   ├── controllers/
│   │   ├── authController.js          # Register, Login, Quick login by role, OTP flow, Profile
│   │   ├── userController.js          # User profile, role management, alert preferences
│   │   ├── weatherController.js       # Live weather by location/coords, hourly weather, sync
│   │   ├── forecastController.js      # 7-day forecast by location/coords
│   │   ├── thermalStressController.js # Real-time WBGT, UTCI, Heat Index, on-the-fly calculations
│   │   ├── riskController.js          # Mortality risk index, historical trends, vulnerable population
│   │   ├── alertController.js         # Active alerts, filter by location/severity, broadcast, SMS templates
│   │   ├── locationController.js      # List Indian cities/districts, hotspots, search, wards, emergency resources
│   │   └── dashboardController.js     # Aggregated dashboard master overview, zone risk map, statistics
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth
│   │   ├── userRoutes.js              # /api/users
│   │   ├── weatherRoutes.js           # /api/weather
│   │   ├── forecastRoutes.js          # /api/forecasts
│   │   ├── thermalStressRoutes.js     # /api/thermal-stress
│   │   ├── riskRoutes.js              # /api/risk
│   │   ├── alertRoutes.js             # /api/alerts
│   │   ├── locationRoutes.js          # /api/locations
│   │   └── dashboardRoutes.js         # /api/dashboard
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & role-based access control (RBAC)
│   │   ├── errorMiddleware.js         # Centralized error handler & 404 handler
│   │   └── validationMiddleware.js    # Input validation schemas
│   ├── utils/
│   │   ├── responseFormatter.js       # Standardized JSON response envelope
│   │   ├── logger.js                  # Structured logging utility
│   │   └── seedData.js                # Curated seed dataset for 40+ Indian cities, wards, users
│   └── app.js                         # Express app setup, CORS, Helmet, routes, middleware
├── scripts/
│   ├── seed.js                        # Database seeder script
│   └── testApi.js                     # Comprehensive test runner for all endpoints
├── server.js                          # Server bootstrapper & port listener
├── .env.example                       # Environment configuration template
├── package.json                       # Backend dependencies & scripts
└── README.md                          # Full API documentation & integration guide
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set configuration:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/thermoguard
JWT_SECRET=thermoguard_jwt_super_secure_production_secret_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### 3. Seed Database (Optional but Recommended)
Populate MongoDB with default authority/citizen accounts, 40+ curated Indian cities, ward microclimates, and emergency hospitals:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Verify every endpoint, JWT authentication, and calculation algorithm:
```bash
npm test
```

### 5. Start the Server
```bash
# Production start
npm start

# Development with hot reload
npm run dev
```
The API server will listen on `http://localhost:5000`.

---

## 🔑 Default Demo Accounts

| Role | Email / Identifier | Password | Access Level |
|---|---|---|---|
| **Authority** | `officer4102@gov.in` | `officerPassword123` | Disaster Control Officer, Alert Broadcast, Full Administrative Access |
| **Citizen** | `user8204@thermoguard.in` | `citizenPassword123` | Public Community User, Localized Heat Warning, Emergency Directory |
| **Admin** | `admin@thermoguard.gov.in` | `adminPassword123` | Master System Controller & Lead Meteorologist |

---

## 📡 REST API Reference

All successful responses follow the standardized envelope:
```json
{
  "success": true,
  "message": "Description of outcome",
  "data": { ... },
  "meta": { ... }
}
```

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login with email/officerId & password/passcode | Public |
| `POST` | `/api/auth/quick-login` | Instant one-click login by role (`{ role: "authority" \| "citizen" }`) | Public |
| `POST` | `/api/auth/send-otp` | Trigger citizen mobile OTP simulation (`{ phone: "9876543210" }`) | Public |
| `POST` | `/api/auth/verify-otp` | Verify OTP and authenticate citizen | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile | `Bearer <token>` |
| `POST` | `/api/auth/logout` | Invalidate session | Public |

### 2. User Management (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/profile` | Get detailed user profile | `Bearer <token>` |
| `PUT` | `/api/users/profile` | Update profile, location, alert preferences | `Bearer <token>` |
| `GET` | `/api/users` | List all users in system | Authority / Admin |

### 3. Weather & Observations (`/api/weather`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/weather/live` | Live meteorological data & thermal stress (Params: `code`, `lat`, `lon`) | Public |
| `GET` | `/api/weather/hourly` | 24-hour diurnal temperature, humidity, WBGT, and heat index curve | Public |
| `POST` | `/api/weather/sync` | Trigger on-demand sync with meteorological feed | Public |

### 4. Forecasts (`/api/forecasts`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/forecasts` | 3 to 7-Day high-resolution heatwave & biometeorological forecast | Public |
| `GET` | `/api/forecasts/location/:id` | 7-Day forecast for specific location ID | Public |

### 5. Thermal Stress Engine (`/api/thermal-stress`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/thermal-stress/current` | Current WBGT, UTCI, Heat Index, and Stress Category | Public |
| `POST` | `/api/thermal-stress/calculate` | Compute WBGT, UTCI, HI, Mortality Risk on-the-fly | Public |

**Example Request (`POST /api/thermal-stress/calculate`):**
```json
{
  "temperature": 44.5,
  "humidity": 32,
  "windSpeed": 3.0,
  "solarRadiation": 950,
  "lat": 28.61
}
```

### 6. Mortality & Risk Analysis (`/api/risk`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/risk/mortality` | Mortality risk index & vulnerable demographic exposure | Public |
| `GET` | `/api/risk/historical` | Historical Indian heatwave mortality trend dataset (2019–2026) | Public |
| `GET` | `/api/risk/recommendations` | Sector-wise NDMA Heat Action Plan emergency directives | Public |

### 7. Heatwave Alerts (`/api/alerts`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/alerts` | Get all active heatwave warnings (filter: `level`, `severity`) | Public |
| `GET` | `/api/alerts/location/:id` | Get active alerts for specific location | Public |
| `POST` | `/api/alerts` | Issue and register new emergency heatwave alert | Authority / Admin |
| `GET` | `/api/alerts/sms-templates` | Multi-lingual SMS & WhatsApp dispatch templates | Public |
| `POST` | `/api/alerts/broadcast` | Simulate mass SMS/WhatsApp broadcast to vulnerable zones | Authority / Admin |

### 8. Locations & Emergency Infrastructure (`/api/locations`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/locations` | Get 40+ curated Indian cities and district coordinates | Public |
| `GET` | `/api/locations/hotspots` | Get extreme heatwave hotspot list | Public |
| `GET` | `/api/locations/:id` | Get specific location details | Public |
| `GET` | `/api/locations/:id/wards` | Get microclimate ward zones with thermal metrics | Public |
| `GET` | `/api/locations/:id/emergency` | Get nearby Heat ICUs, Cooling Shelters, Water Kiosks | Public |

### 9. Master Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/overview` | Unified master payload containing weather, thermal metrics, 7-day forecast, hourly curve, wards, emergency resources, and recommendations | Public |
| `GET` | `/api/dashboard/zone-risk` | Spatial ward risk mapping for GIS | Public |
| `GET` | `/api/dashboard/statistics` | Aggregated national heatwave statistics & active spells | Public |

---

## 🔬 Scientific Algorithms Implemented

1. **Magnus-Tetens Dew Point Equation**:
   $$\alpha(T, RH) = \frac{17.27 \times T}{237.7 + T} + \ln\left(\frac{RH}{100}\right)$$
   $$T_{dew} = \frac{237.7 \times \alpha}{17.27 - \alpha}$$

2. **Rothfusz Heat Index Regression**:
   $$HI = -42.379 + 2.04901523\,T_F + 10.14333127\,RH - 0.22475541\,T_F\,RH - 0.00683783\,T_F^2 - 0.05481717\,RH^2 + 0.00122874\,T_F^2\,RH + 0.00085282\,T_F\,RH^2 - 0.00000199\,T_F^2\,RH^2$$

3. **Liljegren / Australian BOM WBGT Approximation**:
   $$T_w \approx T \arctan\left(0.151977\sqrt{RH + 8.313659}\right) + \arctan(T + RH) - \arctan(RH - 1.676331) + 0.00391838(RH)^{1.5}\arctan(0.023101\,RH) - 4.686035$$
   $$T_g \approx T + 0.025\,S_r - 0.8\sqrt{v}$$
   $$WBGT = 0.7\,T_w + 0.2\,T_g + 0.1\,T$$

4. **Universal Thermal Climate Index (UTCI)**:
   Calculates human heat balance based on ambient temperature, water vapor pressure ($P_a$), mean radiant temperature ($T_{mrt}$), and 10m wind speed ($v_a$).

5. **IMD Warning Levels**:
   - **RED ALERT (Take Action)**: $WBGT \ge 33^\circ\text{C}$ or $T_{max} \ge \text{Threshold} + 5.5^\circ\text{C}$
   - **ORANGE ALERT (Be Prepared)**: $WBGT \ge 30^\circ\text{C}$ or $T_{max} \ge \text{Threshold} + 3.5^\circ\text{C}$
   - **YELLOW WATCH (Be Updated)**: $WBGT \ge 27^\circ\text{C}$ or $T_{max} \ge \text{Threshold}$
   - **GREEN (Normal)**: Baseline conditions

---

## 🌐 Frontend Integration

The frontend connects to this backend using the environment variable:
```env
VITE_API_URL=http://localhost:5000/api
```

Example frontend API call for the master dashboard:
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/overview?code=${locationCode}`);
const result = await response.json();
console.log(result.data.thermalMetrics.wbgt);
```
