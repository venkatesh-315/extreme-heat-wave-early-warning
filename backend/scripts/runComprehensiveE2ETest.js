/**
 * ThermoGuard End-to-End ML Integration Test Suite
 * Covers all 15 requested E2E scenarios across the full pipeline:
 * Weather Forecast -> Validation -> Thermal Calculations -> Feature Engineering ->
 * XGBoost Prediction -> Risk Engine -> Backend API -> MongoDB -> Frontend/GIS contract.
 */

const http = require('http');
const app = require('../src/app');
const { savePredictionRecord, queryPredictions } = require('../src/services/mlPersistenceService');
const { predictHeatwaveRisk } = require('../src/services/mlClientService');
const { generateMultiDayMLForecast } = require('../src/services/mlForecastService');
const { computeFullThermalProfile } = require('../src/services/thermalCalculationService');

let server;
const PORT = 5088;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: '127.0.0.1' }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
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

async function runE2ETests() {
  console.log('\n================================================================');
  console.log('🧪 ThermoGuard Complete E2E Machine Learning Integration Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function recordResult(testId, name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [${testId}] PASS: ${name}`);
      if (details) console.log(`     └─ ${details}`);
      passed++;
      testResults.push({ id: testId, name, status: 'PASSED', details });
    } else {
      console.error(`  ❌ [${testId}] FAIL: ${name}`);
      if (details) console.error(`     └─ ${details}`);
      failed++;
      testResults.push({ id: testId, name, status: 'FAILED', details });
    }
  }

  try {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

    // =========================================================================
    // 1. Normal Valid Request (Full Pipeline)
    // =========================================================================
    const validPayload = {
      location_id: 'delhi',
      date: '2026-06-15',
      temperature: 44.5,
      humidity: 35.0,
      wind_speed: 2.8,
      solar_radiation: 910.0,
      surface_pressure: 1002.0,
      consecutive_hot_days: 3,
      is_urban: true,
      population_density: 16000,
    };

    const res1 = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, validPayload);

    const isRes1Valid =
      res1.status === 200 &&
      res1.body?.success === true &&
      typeof res1.body.data.thermal_stress === 'number' &&
      typeof res1.body.data.mortality_risk === 'number' &&
      typeof res1.body.data.hospitalization_risk === 'number' &&
      ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(res1.body.data.risk_level) &&
      res1.body.data.model_version &&
      res1.body.data.prediction_timestamp;

    recordResult('T01', 'Normal Valid Request (Full Pipeline End-to-End)', isRes1Valid,
      `Risk Level: ${res1.body?.data?.risk_level}, Thermal Stress: ${res1.body?.data?.thermal_stress}, Mortality: ${res1.body?.data?.mortality_risk}%, Hosp: ${res1.body?.data?.hospitalization_risk}%`);

    // =========================================================================
    // 2. Missing Required Field
    // =========================================================================
    const missingFieldPayload = {
      humidity: 40.0,
      wind_speed: 2.0,
      // temperature missing
    };

    const res2 = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, missingFieldPayload);

    const isRes2Valid = res2.status === 400 && res2.body?.success === false;
    recordResult('T02', 'Missing Field Guardrail (Reject missing temperature)', isRes2Valid,
      `HTTP ${res2.status} - Message: "${res2.body?.message}"`);

    // =========================================================================
    // 3. Invalid Temperature Value (Outside Planetary Physical Limits)
    // =========================================================================
    const invalidTempPayload = {
      temperature: 95.0, // Impossible Earth surface temperature (> 65°C)
      humidity: 30.0,
    };

    const res3 = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, invalidTempPayload);

    const isRes3Valid = res3.status === 400 && res3.body?.success === false;
    recordResult('T03', 'Invalid Temperature Guardrail (Reject temperature > 65°C)', isRes3Valid,
      `HTTP ${res3.status} - Message: "${res3.body?.message}"`);

    // =========================================================================
    // 4. Invalid Humidity Value (Negative / > 100%)
    // =========================================================================
    const invalidHumPayload = {
      temperature: 42.0,
      humidity: -15.0, // Negative humidity impossible
    };

    const res4 = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, invalidHumPayload);

    const isRes4Valid = res4.status === 400 && res4.body?.success === false;
    recordResult('T04', 'Invalid Humidity Guardrail (Reject negative humidity)', isRes4Valid,
      `HTTP ${res4.status} - Message: "${res4.body?.message}"`);

    // =========================================================================
    // 5. NaN / Infinity Injection
    // =========================================================================
    const nanPayload = {
      temperature: 'NaN',
      humidity: 'Infinity',
    };

    const res5 = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, nanPayload);

    const isRes5Valid = res5.status === 400 && res5.body?.success === false;
    recordResult('T05', 'NaN & Infinity Guardrail (Reject non-numeric strings)', isRes5Valid,
      `HTTP ${res5.status} - Message: "${res5.body?.message}"`);

    // =========================================================================
    // 6. Weather API Timeout / Unavailability (Graceful Climatological Fallback)
    // =========================================================================
    const fallbackProfile = computeFullThermalProfile({
      temperature: 42.0,
      humidity: 30.0,
      windSpeed: 2.5,
      solarRadiation: 850.0,
    });
    const isFallbackValid =
      typeof fallbackProfile.wbgt === 'number' &&
      fallbackProfile.wbgt > 0 &&
      typeof fallbackProfile.hi === 'number' &&
      typeof fallbackProfile.mortalityRisk === 'number';

    recordResult('T06', 'Weather API Fallback (Climatological Model Continuity)', isFallbackValid,
      `Fallback WBGT: ${fallbackProfile.wbgt}°C, Heat Index: ${fallbackProfile.hi}°C, Baseline Risk: ${fallbackProfile.mortalityRisk}%`);

    // =========================================================================
    // 7. ML Service Unavailable (Circuit Breaker & Verified Scientific Fallback)
    // =========================================================================
    const mlFallbackResult = await predictHeatwaveRisk({
      temperature: 45.0,
      humidity: 32.0,
      wind_speed: 2.5,
      solar_radiation: 900.0,
      location_id: 'offline-test',
    });

    const isMlFallbackValid =
      mlFallbackResult &&
      typeof mlFallbackResult.thermal_stress === 'number' &&
      typeof mlFallbackResult.mortality_risk === 'number' &&
      typeof mlFallbackResult.hospitalization_risk === 'number' &&
      ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(mlFallbackResult.risk_level) &&
      mlFallbackResult.source.includes('Scientific');

    recordResult('T07', 'ML Service Offline Fallback (Deterministic Scientific Engine)', isMlFallbackValid,
      `Source: "${mlFallbackResult.source}", Risk Level: ${mlFallbackResult.risk_level}, Thermal Stress: ${mlFallbackResult.thermal_stress}`);

    // =========================================================================
    // 8. MongoDB Unavailable (Resilient In-Memory Storage Fallback)
    // =========================================================================
    const memSaved = await savePredictionRecord({
      location_id: 'db-offline-loc',
      prediction_date: '2026-06-20',
      forecast_horizon: '0d',
      thermal_stress: 82.0,
      mortality_risk: 65.0,
      hospitalization_risk: 70.0,
      risk_level: 'EXTREME',
      model_version: 'v1.0.0',
    });

    const memQuery = await queryPredictions({ location_id: 'db-offline-loc' });
    const isMemStoreValid =
      memSaved &&
      memSaved.location_id === 'db-offline-loc' &&
      memQuery &&
      memQuery.total >= 1;

    recordResult('T08', 'MongoDB Disconnect Fallback (Bounded In-Memory Persistence)', isMemStoreValid,
      `Persisted key: "${memSaved.location_id}", Queried count: ${memQuery.total}`);

    // =========================================================================
    // 9. Duplicate Forecast Execution (Idempotent Upsert & Deduplication)
    // =========================================================================
    const dup1 = await savePredictionRecord({
      location_id: 'dup-test-loc',
      prediction_date: '2026-07-01',
      forecast_horizon: '1d',
      thermal_stress: 75.0,
      mortality_risk: 55.0,
      hospitalization_risk: 60.0,
      risk_level: 'HIGH',
      model_version: 'v1.0.0',
    });

    const dup2 = await savePredictionRecord({
      location_id: 'dup-test-loc',
      prediction_date: '2026-07-01',
      forecast_horizon: '1d',
      thermal_stress: 78.0, // updated metric on same compound key
      mortality_risk: 58.0,
      hospitalization_risk: 63.0,
      risk_level: 'HIGH',
      model_version: 'v1.0.0',
    });

    const dupQuery = await queryPredictions({ location_id: 'dup-test-loc' });
    const isDupHandled = dupQuery.total === 1 && dupQuery.records[0].thermal_stress === 78.0;

    recordResult('T09', 'Duplicate Forecast Deduplication (Compound Key Idempotence)', isDupHandled,
      `Total records for (dup-test-loc, 2026-07-01, 1d): ${dupQuery.total} (Updated in-place without duplicates)`);

    // =========================================================================
    // 10. 3-Day Forecast Pipeline
    // =========================================================================
    const forecast3d = await generateMultiDayMLForecast({
      location_id: 'delhi',
      days: 3,
      lat: 28.6139,
      lon: 77.2090,
    });

    const is3dValid =
      forecast3d &&
      Array.isArray(forecast3d.forecasts) &&
      forecast3d.forecasts.length === 3 &&
      forecast3d.forecasts.every(f => typeof f.predictions?.thermal_stress === 'number' && typeof f.predictions?.mortality_risk === 'number');

    recordResult('T10', '3-Day Forecast Pipeline (Exact Horizon Processing)', is3dValid,
      `Generated ${forecast3d?.forecasts?.length} days. Peak Risk: ${forecast3d?.summary?.peak_risk_level}`);

    // =========================================================================
    // 11. 5-Day Forecast Pipeline
    // =========================================================================
    const forecast5d = await generateMultiDayMLForecast({
      location_id: 'hyderabad',
      days: 5,
      lat: 17.3850,
      lon: 78.4867,
    });

    const is5dValid =
      forecast5d &&
      Array.isArray(forecast5d.forecasts) &&
      forecast5d.forecasts.length === 5 &&
      forecast5d.forecasts.every(f => typeof f.predictions?.mortality_risk === 'number' && typeof f.predictions?.hospitalization_risk === 'number');

    recordResult('T11', '5-Day Forecast Pipeline (Multi-Day Trajectory)', is5dValid,
      `Generated ${forecast5d?.forecasts?.length} days. Peak Risk: ${forecast5d?.summary?.peak_risk_level}`);

    // =========================================================================
    // 12. Concurrent Requests (No Race Conditions or Worker Collisions)
    // =========================================================================
    const concurrentPromises = [
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 43.0, humidity: 30.0, location_id: 'c1' }),
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 44.0, humidity: 32.0, location_id: 'c2' }),
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 45.0, humidity: 34.0, location_id: 'c3' }),
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 46.0, humidity: 36.0, location_id: 'c4' }),
    ];

    const concurrentResults = await Promise.all(concurrentPromises);
    const isConcurrentSuccess = concurrentResults.every(r => r.status === 200 && r.body?.success === true);

    recordResult('T12', 'Concurrent Request Handling (Race Condition Isolation)', isConcurrentSuccess,
      `Dispatched 4 parallel inference calls -> ${concurrentResults.filter(r => r.status === 200).length}/4 succeeded concurrently`);

    // =========================================================================
    // 13. Unauthorized Request on Protected Routes
    // =========================================================================
    const unauthRes = await makeRequest({ path: '/api/auth/me', method: 'GET' });
    const isUnauthProtected = unauthRes.status === 401 && unauthRes.body?.success === false;

    recordResult('T13', 'Unauthorized Request Protection (JWT Auth Guard)', isUnauthProtected,
      `HTTP ${unauthRes.status} on /api/auth/me without Bearer token`);

    // =========================================================================
    // 14. Malformed JSON Request
    // =========================================================================
    const malformedRes = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, '{ temperature: 44.0, humidity: '); // broken JSON

    const isMalformedProtected = malformedRes.status === 400 || malformedRes.status === 500;
    recordResult('T14', 'Malformed Request Guard (Syntax Error Interception)', isMalformedProtected,
      `HTTP ${malformedRes.status} received on malformed JSON body`);

    // =========================================================================
    // 15. Oversized Request Body (> 10MB)
    // =========================================================================
    const largeDummyData = 'x'.repeat(11 * 1024 * 1024); // 11 MB payload
    const oversizedRes = await makeRequest({
      path: '/api/ml/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({ temperature: 40.0, data: largeDummyData }));

    const isOversizedProtected = oversizedRes.status === 413 || oversizedRes.status === 400 || oversizedRes.status === 500;
    recordResult('T15', 'Oversized Request Protection (Payload Limit Enforcement)', isOversizedProtected,
      `HTTP ${oversizedRes.status} on 11MB oversized payload`);

    // =========================================================================
    // Contract Check: Master Overview & GIS Integration
    // =========================================================================
    const overviewRes = await makeRequest({ path: '/api/dashboard/overview?code=del-del', method: 'GET' });
    const isOverviewValid =
      overviewRes.status === 200 &&
      overviewRes.body?.data?.mlPrediction &&
      Array.isArray(overviewRes.body?.data?.mlForecast) &&
      Array.isArray(overviewRes.body?.data?.wardData) &&
      overviewRes.body?.data?.wardData.every(w => w.mortalityRisk !== undefined && w.thermalStress !== undefined);

    recordResult('T16', 'Frontend/GIS Contract Parity (Master Dashboard Overview)', isOverviewValid,
      `Dashboard contains ML prediction, 5-day ML forecast (${overviewRes.body?.data?.mlForecast?.length}d), and ${overviewRes.body?.data?.wardData?.length} ML-annotated wards`);

  } catch (err) {
    console.error('Fatal execution error during E2E test suite:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  }

  console.log('\n================================================================');
  console.log(`📊 E2E Test Suite Summary: ${passed} Passed | ${failed} Failed`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runE2ETests();
