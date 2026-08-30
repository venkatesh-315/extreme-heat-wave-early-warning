/**
 * Verification & Security Compliance Test Suite
 * Tests health endpoint, ML prediction endpoint, input sanitization, and persistence
 */

const http = require('http');
const app = require('../src/app');
const { savePredictionRecord, queryPredictions } = require('../src/services/mlPersistenceService');
const { predictHeatwaveRisk } = require('../src/services/mlClientService');
const { generateMultiDayMLForecast } = require('../src/services/mlForecastService');

let server;
const PORT = 5099;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: '127.0.0.1' }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAuditChecks() {
  console.log('\n========================================================');
  console.log('🔒 Running ThermoGuard Security & Reliability Audit Checks');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

    // 1. Root & Health Checks
    const rootRes = await request({ path: '/', method: 'GET' });
    assert(rootRes.status === 200 && rootRes.body.status === 'ONLINE', 'Root endpoint reports status ONLINE');

    const healthRes = await request({ path: '/api/health', method: 'GET' });
    assert(healthRes.status === 200 && healthRes.body.status === 'HEALTHY', 'Express health probe returns HTTP 200 HEALTHY');
    assert(typeof healthRes.body.uptimeSeconds === 'number', 'Health probe includes uptime telemetry');

    // 2. ML Prediction Endpoint Verification
    const predPayload = {
      temperature: 44.5,
      humidity: 34.0,
      wind_speed: 2.8,
      solar_radiation: 920.0,
      consecutive_hot_days: 3,
      is_urban: true,
      location_id: 'delhi-audit',
      date: '2026-06-15',
    };

    const mlRes = await request({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, predPayload);

    assert(mlRes.status === 200, 'POST /api/ml/predict responds with HTTP 200');
    assert(typeof mlRes.body.data.thermal_stress === 'number', 'Thermal stress index is calculated and returned');
    assert(typeof mlRes.body.data.mortality_risk === 'number', 'Mortality risk score is calculated and returned');
    assert(typeof mlRes.body.data.hospitalization_risk === 'number', 'Hospitalization risk score is calculated and returned');
    assert(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(mlRes.body.data.risk_level), 'Standardized risk level assigned');

    // 3. Security Guardrails: Validation & Input Sanitization
    const invalidPayload = { humidity: 30.0 }; // missing temperature
    const badRes = await request({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, invalidPayload);
    assert(badRes.status === 400, 'Validation Guardrail: Missing required temperature rejected with HTTP 400');

    // 4. Persistence & Deduplication
    const saved1 = await savePredictionRecord({
      location_id: 'audit-loc',
      prediction_date: '2026-06-15',
      forecast_horizon: '1d',
      thermal_stress: 85.0,
      mortality_risk: 72.0,
      hospitalization_risk: 78.0,
      risk_level: 'EXTREME',
      model_version: 'v1.0.0',
    });
    assert(saved1 && saved1.location_id === 'audit-loc', 'Persisted prediction record successfully');

    const queryResult = await queryPredictions({ location_id: 'audit-loc' });
    assert(queryResult.total >= 1, 'Queried stored predictions using location_id filter');

    // 5. 3-5 Day Forecast Pipeline
    const forecastResult = await generateMultiDayMLForecast({
      location_id: 'audit-loc',
      days: 3,
      lat: 28.6139,
      lon: 77.2090,
    });
    assert(forecastResult && Array.isArray(forecastResult.forecasts), 'Generated 3-day ML forecast');
    assert(forecastResult.forecasts.length === 3, 'Forecast horizon produces exact requested days count (3 days)');

    // 6. Master Dashboard Overview Endpoint
    const overviewRes = await request({ path: '/api/dashboard/overview?code=del-del', method: 'GET' });
    assert(overviewRes.status === 200 && overviewRes.body.success === true, 'Dashboard master overview endpoint returns HTTP 200');
    assert(Boolean(overviewRes.body.data.mlPrediction), 'Dashboard master payload contains ML prediction telemetry');
    assert(Array.isArray(overviewRes.body.data.mlForecast), 'Dashboard master payload contains 5-day ML forecast array');

  } catch (err) {
    console.error('Audit test failed with exception:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  }

  console.log('\n========================================================');
  console.log(`📊 Audit Verification: ${passed} Passed | ${failed} Failed`);
  console.log('========================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAuditChecks();
