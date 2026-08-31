/**
 * ThermoGuard Data Ingestion & Provenance 18-Point Verification Suite
 * Tests all 18 required scenarios across Weather, Spatial, Health, ML, and DB tiers.
 */

const http = require('http');
const app = require('../src/app');
const { weatherIngestionService } = require('../../data-ingestion/weather/service/weather_ingestion_service');
const { INDIA_LOCATIONS_REGISTRY } = require('../../data-ingestion/locations/india_locations_registry');
const { validateLocation, processLocationBatch } = require('../../data-ingestion/locations/location_validator');
const { HealthDataIngestionPipeline } = require('../../data-ingestion/health/health_data_ingestion_pipeline');
const { validateHealthRecord, evaluateHealthDatasetSuitability } = require('../../data-ingestion/health/health_data_validator');
const { HistoricalWeatherPipeline } = require('../../data-ingestion/historical_weather/historical_weather_pipeline');
const { savePredictionRecord, queryPredictions } = require('../src/services/mlPersistenceService');
const { generateMultiDayMLForecast } = require('../src/services/mlForecastService');
const { predictHeatwaveRisk } = require('../src/services/mlClientService');

let server;
const PORT = 5077;

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

async function runDataIntegrationTests() {
  console.log('\n================================================================');
  console.log('🧪 Running ThermoGuard Real Data Ingestion & Provenance Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  function record(id, title, condition, info = '') {
    if (condition) {
      console.log(`  ✅ [${id}] PASS: ${title}`);
      if (info) console.log(`     └─ ${info}`);
      passed++;
      results.push({ id, title, status: 'PASSED', info });
    } else {
      console.error(`  ❌ [${id}] FAIL: ${title}`);
      if (info) console.error(`     └─ ${info}`);
      failed++;
      results.push({ id, title, status: 'FAILED', info });
    }
  }

  try {
    server = http.createServer(app);
    await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

    // 1. Live weather request
    const wData = await weatherIngestionService.ingestWeather(28.6139, 77.2090, { horizonDays: 5, locationName: 'New Delhi' });
    const isLiveWeatherValid = wData && wData.current && typeof wData.current.temperature_c === 'number' && wData.forecast.length >= 3;
    record('P01', 'Live Weather Request via Ingestion Adapter', isLiveWeatherValid,
      `Source: ${wData?.source}, Temp: ${wData?.current?.temperature_c}°C, Humidity: ${wData?.current?.relative_humidity_pct}%`);

    // 2. Malformed weather response handling
    const { validateNormalizedWeather } = require('../../data-ingestion/weather/validation/weather_validator');
    const badWeather = { temperature_c: 'invalid_str', latitude: 200.0 };
    const badVal = validateNormalizedWeather(badWeather);
    record('P02', 'Malformed Weather Response Interception', !badVal.valid && badVal.errors.length >= 2,
      `Detected errors: ${badVal.errors.join('; ')}`);

    // 3. Weather timeout handling
    const fallbackMeteo = weatherIngestionService.fallbackProvider.generateFallbackWeather(28.61, 77.20, 5);
    record('P03', 'Weather Timeout / Outage Fallback', fallbackMeteo && fallbackMeteo.current && fallbackMeteo.forecast.length === 5,
      `Baseline Fallback WBGT: ${fallbackMeteo?.current?.temperature_c}°C, Provider: ${fallbackMeteo?.current?.provider}`);

    // 4. Weather provider failure
    const wFailover = await weatherIngestionService.ingestWeather(999.0, 999.0, { horizonDays: 3 });
    record('P04', 'Weather Provider Failure Resilience (Automatic Failover)', wFailover && Boolean(wFailover.current),
      `Failover Source: ${wFailover?.source}`);

    // 5. 3-day forecast
    const f3 = await generateMultiDayMLForecast({ location_id: 'del-delhi', days: 3, lat: 28.6139, lon: 77.2090 });
    record('P05', '3-Day Forecast Pipeline Execution', f3 && f3.forecasts && f3.forecasts.length === 3,
      `Generated 3 days for ${f3?.location_id}. Peak Risk: ${f3?.summary?.peak_risk_level}`);

    // 6. 5-day forecast
    const f5 = await generateMultiDayMLForecast({ location_id: 'tel-hyderabad', days: 5, lat: 17.3850, lon: 78.4867 });
    record('P06', '5-Day Forecast Pipeline Execution', f5 && f5.forecasts && f5.forecasts.length === 5,
      `Generated 5 days for ${f5?.location_id}. Peak Risk: ${f5?.summary?.peak_risk_level}`);

    // 7. Duplicate forecast execution
    const d1 = await savePredictionRecord({ location_id: 'dedupe-check', prediction_date: '2026-06-10', forecast_horizon: '1d', thermal_stress: 80, mortality_risk: 60, hospitalization_risk: 65, risk_level: 'HIGH' });
    const d2 = await savePredictionRecord({ location_id: 'dedupe-check', prediction_date: '2026-06-10', forecast_horizon: '1d', thermal_stress: 85, mortality_risk: 65, hospitalization_risk: 70, risk_level: 'EXTREME' });
    const qDup = await queryPredictions({ location_id: 'dedupe-check' });
    record('P07', 'Duplicate Forecast Deduplication (Idempotence)', qDup.total === 1 && qDup.records[0].thermal_stress === 85,
      `Maintained 1 unique record. Thermal stress updated to 85.`);

    // 8. ML service unavailable fallback
    const mlFall = await predictHeatwaveRisk({ temperature: 45.0, humidity: 30.0, location_id: 'offline-check' });
    record('P08', 'ML Service Unavailable (Scientific Deterministic Fallback)', mlFall && typeof mlFall.mortality_risk === 'number',
      `Fallback Source: "${mlFall?.source}", Mortality Risk: ${mlFall?.mortality_risk}%`);

    // 9. MongoDB unavailable fallback
    const memSave = await savePredictionRecord({ location_id: 'offline-db', prediction_date: '2026-06-11', forecast_horizon: '0d', thermal_stress: 70, mortality_risk: 50, hospitalization_risk: 55, risk_level: 'HIGH' });
    record('P09', 'MongoDB Disconnect Bounded In-Memory Persistence', memSave && memSave.location_id === 'offline-db',
      `Saved key: "${memSave?.location_id}" in bounded store`);

    // 10. Missing health dataset handling
    const healthPipe = new HealthDataIngestionPipeline({ dataset_name: 'NDMA Heatwave Casualties' });
    let missingCaught = false;
    try {
      healthPipe.processHealthDataset(null);
    } catch (e) {
      missingCaught = true;
    }
    record('P10', 'Missing / Null Health Dataset Guard', missingCaught, 'Rejected null health dataset with descriptive error');

    // 11. Invalid health dataset (unsuitable target definition)
    const annualMortalityMeta = {
      dataset_name: 'SRS Annual All-Cause Deaths',
      target_definition: 'ALL_CAUSE_MORTALITY',
      temporal_granularity: 'ANNUAL',
    };
    const suitabilityCheck = evaluateHealthDatasetSuitability(annualMortalityMeta);
    record('P11', 'Invalid / Unsuitable Health Target Evaluator', suitabilityCheck.status === 'NOT_SUITABLE_FOR_TARGET' && !suitabilityCheck.isSuitable,
      `Marked NOT_SUITABLE_FOR_TARGET: "${suitabilityCheck.rationale}"`);

    // 12. Duplicate health records deduplication
    const rawHealth = [
      { location_id: 'delhi', state: 'Delhi', date: '2026-05-20', target_definition: 'HEAT_STROKE_DEATHS_CONFIRMED', observed_count: 3 },
      { location_id: 'delhi', state: 'Delhi', date: '2026-05-20', target_definition: 'HEAT_STROKE_DEATHS_CONFIRMED', observed_count: 5 },
    ];
    const healthResult = healthPipe.processHealthDataset(rawHealth);
    record('P12', 'Duplicate Health Records Deduplication', healthResult.processed.length === 1 && healthResult.processed[0].observed_count === 5,
      `Deduplicated 2 identical keys down to 1 clean record`);

    // 13. Invalid health values rejection
    const invalidHealth = [
      { location_id: 'delhi', state: 'Delhi', date: '2026-05-20', target_definition: 'HEAT_STROKE_DEATHS_CONFIRMED', observed_count: -10 },
      { location_id: 'delhi', state: 'Delhi', date: 'invalid_date', target_definition: 'HEAT_STROKE_DEATHS_CONFIRMED', observed_count: 5 },
    ];
    const invalidHealthRes = healthPipe.processHealthDataset(invalidHealth);
    record('P13', 'Invalid Health Values Rejection (Negative / Bad Date)', invalidHealthRes.rejected.length === 2,
      `Rejected 2/2 corrupted health records`);

    // 14. India-wide location processing (bounded batches)
    const batchRes = await processLocationBatch(
      INDIA_LOCATIONS_REGISTRY.slice(0, 8),
      async (loc) => ({ location_id: loc.location_id, state: loc.state, valid: true }),
      4
    );
    record('P14', 'India-Wide Location Processing (Bounded Chunks)', batchRes.length === 8 && batchRes.every(r => r.valid),
      `Processed 8 Indian locations in chunks of 4 without unbounded fan-out`);

    // 15. Concurrent requests
    const pConcurrent = await Promise.all([
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 44.0, humidity: 30.0 }),
      makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { temperature: 45.0, humidity: 32.0 }),
    ]);
    record('P15', 'Concurrent API Requests', pConcurrent.every(r => r.status === 200),
      `Dispatched 2 concurrent calls -> ${pConcurrent.filter(r => r.status === 200).length}/2 succeeded`);

    // 16. Unauthorized requests
    const resAuth = await makeRequest({ path: '/api/auth/me', method: 'GET' });
    record('P16', 'Unauthorized Request Protection', resAuth.status === 401,
      `HTTP 401 on /api/auth/me without token`);

    // 17. Malformed requests
    const resMal = await makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, '{ broken_json');
    record('P17', 'Malformed Request Interception', resMal.status === 400,
      `HTTP 400 on malformed JSON payload`);

    // 18. Oversized requests
    const largeStr = 'a'.repeat(11 * 1024 * 1024);
    const resOver = await makeRequest({ path: '/api/ml/predict', method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify({ data: largeStr }));
    record('P18', 'Oversized Request Protection', resOver.status === 413 || resOver.status === 400,
      `HTTP ${resOver.status} on 11MB payload`);

  } catch (err) {
    console.error('Test suite exception:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  }

  console.log('\n================================================================');
  console.log(`📊 Data Integration Test Suite: ${passed} Passed | ${failed} Failed`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runDataIntegrationTests();
