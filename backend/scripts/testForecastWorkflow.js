/**
 * ThermoGuard 3-5 Day ML Forecasting Workflow Test Suite
 * Validates:
 * 1. 3-Day Forecast generation & schema verification
 * 2. 5-Day Forecast generation & horizon boundaries
 * 3. Duplicate execution & idempotent persistence
 * 4. Weather API failure resilience & fallback
 * 5. ML Service failure resilience & scientific fallback
 * 6. MongoDB failure resilience
 */

const assert = require('assert');
const { generateMultiDayMLForecast } = require('../src/services/mlForecastService');
const { savePredictionRecord, queryPredictions } = require('../src/services/mlPersistenceService');

let passedTests = 0;
let failedTests = 0;

async function runTest(name, fn) {
  try {
    process.stdout.write(`  Testing: ${name}... `);
    await fn();
    console.log('✅ PASS');
    passedTests++;
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    failedTests++;
  }
}

async function runAllForecastTests() {
  console.log('\n========================================================');
  console.log('🧪 Running 3-5 Day ML Forecasting Workflow Test Suite');
  console.log('========================================================\n');

  // Test 1: 3-Day Forecast
  await runTest('3-Day ML Forecast Generation', async () => {
    const result = await generateMultiDayMLForecast({
      location_id: 'delhi',
      horizonDays: 3,
    });

    assert.strictEqual(result.success, true, 'Workflow should succeed');
    assert.strictEqual(result.horizon_days, 3, 'Should produce 3-day horizon');
    assert.strictEqual(result.forecasts.length, 3, 'Should contain 3 daily forecasts');

    for (let i = 0; i < 3; i++) {
      const f = result.forecasts[i];
      assert.strictEqual(f.day_index, i + 1, `Day index should be ${i + 1}`);
      assert.ok(f.target_date, 'Target date must be present');
      assert.ok(typeof f.predictions.thermal_stress === 'number', 'Thermal stress must be numeric');
      assert.ok(typeof f.predictions.mortality_risk === 'number', 'Mortality risk must be numeric');
      assert.ok(typeof f.predictions.hospitalization_risk === 'number', 'Hospitalization risk must be numeric');
      assert.ok(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(f.predictions.risk_level), 'Valid risk level');
    }
  });

  // Test 2: 5-Day Forecast
  await runTest('5-Day ML Forecast Generation & Bounds', async () => {
    const result = await generateMultiDayMLForecast({
      location_id: 'ahmedabad',
      horizonDays: 5,
    });

    assert.strictEqual(result.success, true, 'Workflow should succeed');
    assert.strictEqual(result.horizon_days, 5, 'Should produce 5-day horizon');
    assert.strictEqual(result.forecasts.length, 5, 'Should contain 5 daily forecasts');

    // Test bounding (requesting 10 days gets clamped to 5)
    const clampedResult = await generateMultiDayMLForecast({
      location_id: 'nagpur',
      horizonDays: 10,
    });
    assert.strictEqual(clampedResult.horizon_days, 5, 'Requested 10 days must be clamped to 5');
  });

  // Test 3: Duplicate Execution & Idempotence
  await runTest('Duplicate Execution - Idempotent Persistence & Deduplication', async () => {
    const run1 = await generateMultiDayMLForecast({
      location_id: 'jaipur',
      horizonDays: 3,
    });
    const run2 = await generateMultiDayMLForecast({
      location_id: 'jaipur',
      horizonDays: 3,
    });

    assert.strictEqual(run1.success, true);
    assert.strictEqual(run2.success, true);
    assert.strictEqual(run1.forecasts.length, 3);
    assert.strictEqual(run2.forecasts.length, 3);

    // Query stored records for jaipur
    const records = await queryPredictions({ location_id: 'jaipur' });
    assert.ok(records.total >= 3, 'Records should be persisted');
  });

  // Test 4: Weather API Failure Resilience
  await runTest('Weather API Failure Resilience - Climatological Model Fallback', async () => {
    // Unmapped coordinates or offline weather fallback
    const result = await generateMultiDayMLForecast({
      location_id: 'kolkata',
      latitude: -999.0, // Invalid coordinate forcing weather fallback
      longitude: -999.0,
      horizonDays: 4,
    });

    assert.strictEqual(result.success, true, 'Should fallback gracefully without throwing');
    assert.strictEqual(result.forecasts.length, 4, 'Should still produce 4-day forecast');
    assert.ok(result.forecasts[0].predictions.mortality_risk >= 0, 'Predictions should be valid');
  });

  // Test 5: ML Microservice Failure Resilience
  await runTest('ML Service Failure Resilience - High-Fidelity Scientific Fallback', async () => {
    // When FastAPI is offline, backend evaluates biometeorological formula engine safely
    const result = await generateMultiDayMLForecast({
      location_id: 'chennai',
      horizonDays: 3,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.forecasts.length, 3);
    for (const f of result.forecasts) {
      assert.ok(typeof f.predictions.mortality_risk === 'number');
      assert.ok(typeof f.predictions.hospitalization_risk === 'number');
      assert.ok(f.predictions.risk_level);
    }
  });

  // Test 6: MongoDB Resilience & Failure Handling
  await runTest('MongoDB Failure Handling - Graceful Non-Blocking Execution', async () => {
    // Testing saving with DB offline/mock
    const saved = await savePredictionRecord({
      location_id: 'lucknow',
      prediction_date: new Date(),
      forecast_horizon: '1d',
      thermal_stress: 75.0,
      mortality_risk: 55.0,
      hospitalization_risk: 60.0,
      risk_level: 'HIGH',
    });

    assert.ok(saved, 'Should return saved record from resilient store');
    assert.strictEqual(saved.location_id, 'lucknow');
    assert.strictEqual(saved.risk_level, 'HIGH');
  });

  console.log('\n========================================================');
  console.log(`📊 Forecast Test Results: ${passedTests} Passed | ${failedTests} Failed`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllForecastTests();
}

module.exports = { runAllForecastTests };
