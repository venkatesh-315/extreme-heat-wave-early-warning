/**
 * Comprehensive Automated API Test Suite for ThermoGuard
 * Usage: npm test
 */

const http = require('http');
const app = require('../src/app');
const config = require('../src/config/env');

let server;
let baseUrl = `http://localhost:${config.port}`;
let authToken = '';

// Helper for HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (authToken && reqHeaders['Authorization'] === undefined) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    } else if (reqHeaders['Authorization'] === '') {
      delete reqHeaders['Authorization'];
    }

    const options = {
      method,
      headers: reqHeaders,
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('\n========================================================');
  console.log('🧪 Running ThermoGuard Automated API Test Suite');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
    }
  };

  // Start temporary test server if not running
  await new Promise((resolve) => {
    const testPort = 5001;
    baseUrl = `http://localhost:${testPort}`;
    server = app.listen(testPort, () => {
      resolve();
    });
  });

  try {
    // 1. Health & Meta
    await test('GET / - Root info endpoint', async () => {
      const res = await request('GET', '/');
      if (res.status !== 200 || !res.body.project) throw new Error(`Expected 200 with project info, got ${res.status}`);
    });

    await test('GET /api/health - Health check endpoint', async () => {
      const res = await request('GET', '/api/health');
      if (res.status !== 200 || res.body.status !== 'HEALTHY') throw new Error(`Expected HEALTHY, got ${JSON.stringify(res.body)}`);
    });

    // 2. Auth Endpoints
    await test('POST /api/auth/quick-login - Quick login by role (authority)', async () => {
      const res = await request('POST', '/api/auth/quick-login', { role: 'authority' });
      if (res.status !== 200 || !res.body.data.token) throw new Error(`Token missing in quick login: ${JSON.stringify(res.body)}`);
      authToken = res.body.data.token;
    });

    await test('POST /api/auth/register - Register new user', async () => {
      const testEmail = `officer_${Date.now()}@gov.in`;
      const res = await request('POST', '/api/auth/register', {
        name: 'Test Officer Vikram',
        email: testEmail,
        password: 'securePassword123',
        role: 'authority',
        department: 'Heat Disaster Cell',
      });
      if (res.status !== 201 || !res.body.data.user) throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
    });

    await test('POST /api/auth/login - Login with credentials', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'officer4102@gov.in',
        password: 'officerPassword123',
        role: 'authority',
      });
      if (res.status !== 200 || !res.body.data.token) throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
      authToken = res.body.data.token;
    });

    await test('POST /api/auth/send-otp & verify-otp - Citizen mobile OTP flow', async () => {
      const otpRes = await request('POST', '/api/auth/send-otp', { phone: '9876543210' });
      if (otpRes.status !== 200 || !otpRes.body.data.otp) throw new Error(`Send OTP failed: ${JSON.stringify(otpRes.body)}`);

      const verifyRes = await request('POST', '/api/auth/verify-otp', {
        phone: '9876543210',
        otpCode: otpRes.body.data.otp,
        alertLocation: 'Ahmedabad (East / Maninagar)',
      });
      if (verifyRes.status !== 200 || !verifyRes.body.data.token) throw new Error(`Verify OTP failed: ${JSON.stringify(verifyRes.body)}`);
    });

    await test('GET /api/auth/me - Protected user profile with JWT', async () => {
      const res = await request('GET', '/api/auth/me');
      if (res.status !== 200 || !res.body.data.user) throw new Error(`Get me failed: ${JSON.stringify(res.body)}`);
    });

    await test('Protected Route Security - Reject without token', async () => {
      const res = await request('GET', '/api/auth/me', null, { Authorization: '' });
      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    // 3. Weather Endpoints
    await test('GET /api/weather/live - Live weather & thermal metrics (Delhi)', async () => {
      const res = await request('GET', '/api/weather/live?code=del-del');
      if (res.status !== 200 || !res.body.data.weather || !res.body.data.thermalMetrics) {
        throw new Error(`Invalid live weather payload: ${JSON.stringify(res.body)}`);
      }
      if (typeof res.body.data.thermalMetrics.wbgt !== 'number') {
        throw new Error('WBGT metric missing or not numeric');
      }
    });

    await test('GET /api/weather/hourly - 24-hour heat curve', async () => {
      const res = await request('GET', '/api/weather/hourly?lat=28.6139&lon=77.2090');
      if (res.status !== 200 || !Array.isArray(res.body.data.hourly) || res.body.data.hourly.length !== 24) {
        throw new Error(`Expected 24 hourly records, got ${res.body.data?.hourly?.length}`);
      }
    });

    // 4. Forecast Endpoints
    await test('GET /api/forecasts - 7-Day biometeorological forecast', async () => {
      const res = await request('GET', '/api/forecasts?days=7');
      if (res.status !== 200 || !Array.isArray(res.body.data.forecast) || res.body.data.forecast.length !== 7) {
        throw new Error(`Expected 7 days forecast, got ${res.body.data?.forecast?.length}`);
      }
      const day1 = res.body.data.forecast[0];
      if (!day1.wbgt || !day1.utci || !day1.mortalityRisk || !day1.stressCategory) {
        throw new Error(`Forecast day missing key thermal metrics: ${JSON.stringify(day1)}`);
      }
    });

    // 5. Thermal Stress Endpoints
    await test('GET /api/thermal-stress/current - Real-time thermal stress', async () => {
      const res = await request('GET', '/api/thermal-stress/current?lat=27.1306&lon=72.3627'); // Phalodi
      if (res.status !== 200 || !res.body.data.thermalMetrics.wbgt) {
        throw new Error(`Current thermal stress failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('POST /api/thermal-stress/calculate - Scientific on-the-fly calculations', async () => {
      const res = await request('POST', '/api/thermal-stress/calculate', {
        temperature: 44.5,
        humidity: 32,
        windSpeed: 3.5,
        solarRadiation: 950,
        lat: 28.61,
      });
      if (res.status !== 200 || !res.body.data.results.wbgt || !res.body.data.results.utci) {
        throw new Error(`Calculation failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('POST /api/thermal-stress/ml-predict - Python ML XGBoost inference with fallback', async () => {
      const res = await request('POST', '/api/thermal-stress/ml-predict', {
        temperature: 45.2,
        humidity: 34,
        windSpeed: 3.0,
        solarRadiation: 920,
        consecutiveHotDays: 3,
        isUrban: true,
        populationDensity: 15000,
      });
      if (res.status !== 200 || typeof res.body.data.mortality_risk_score !== 'number' || !res.body.data.source) {
        throw new Error(`ML predict failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 6. Risk & Mortality Endpoints
    await test('GET /api/risk/mortality - Mortality risk & vulnerable exposure', async () => {
      const res = await request('GET', '/api/risk/mortality?lat=28.61&lon=77.20&population=2000000');
      if (res.status !== 200 || typeof res.body.data.mortalityRiskScore !== 'number') {
        throw new Error(`Mortality risk failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/risk/historical - Historical heatwave mortality dataset', async () => {
      const res = await request('GET', '/api/risk/historical');
      if (res.status !== 200 || !Array.isArray(res.body.data.historicalTrend)) {
        throw new Error(`Historical mortality trend failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/risk/recommendations - NDMA Action Plan Directives', async () => {
      const res = await request('GET', '/api/risk/recommendations?lat=28.61&lon=77.20');
      if (res.status !== 200 || !Array.isArray(res.body.data.recommendations) || res.body.data.recommendations.length === 0) {
        throw new Error(`Recommendations failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Alert Endpoints
    await test('GET /api/alerts - Active heatwave warnings', async () => {
      const res = await request('GET', '/api/alerts');
      if (res.status !== 200 || !Array.isArray(res.body.data)) {
        throw new Error(`Active alerts failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/alerts/sms-templates - Multi-lingual alert templates', async () => {
      const res = await request('GET', '/api/alerts/sms-templates');
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`SMS templates failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('POST /api/alerts/broadcast - Broadcast alert simulation', async () => {
      const res = await request('POST', '/api/alerts/broadcast', {
        templateId: 'sms-general-en',
        channels: ['sms', 'whatsapp'],
        targetDistrict: 'New Delhi Central',
      });
      if (res.status !== 200 || res.body.data.deliveryStatus !== 'QUEUED_FOR_BROADCAST') {
        throw new Error(`Broadcast simulation failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Locations & Ward Endpoints
    await test('GET /api/locations - 40+ curated Indian cities', async () => {
      const res = await request('GET', '/api/locations');
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length < 20) {
        throw new Error(`Locations retrieval failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/locations/hotspots - Severe heatwave hotspots', async () => {
      const res = await request('GET', '/api/locations/hotspots');
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Hotspots failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/locations/del-del/wards - Microclimate ward zones', async () => {
      const res = await request('GET', '/api/locations/del-del/wards');
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Ward microclimate zones failed: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/locations/del-del/emergency - Emergency shelters and hospitals', async () => {
      const res = await request('GET', '/api/locations/del-del/emergency');
      if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
        throw new Error(`Emergency resources failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. Aggregated Dashboard Overview
    await test('GET /api/dashboard/overview - Complete dashboard master payload', async () => {
      const res = await request('GET', '/api/dashboard/overview?code=del-del');
      if (
        res.status !== 200 ||
        !res.body.data.weather ||
        !res.body.data.thermalMetrics ||
        !res.body.data.wardData ||
        !res.body.data.emergencyResources ||
        !res.body.data.recommendations ||
        !res.body.data.modelConfidence
      ) {
        throw new Error(`Master dashboard overview payload missing keys: ${JSON.stringify(res.body)}`);
      }
    });

    await test('GET /api/dashboard/statistics - Seasonal statistics', async () => {
      const res = await request('GET', '/api/dashboard/statistics');
      if (res.status !== 200 || !res.body.data.monitoredDistricts) {
        throw new Error(`Statistics failed: ${JSON.stringify(res.body)}`);
      }
    });

  } finally {
    server.close();
  }

  console.log('\n========================================================');
  console.log(`📊 Test Results: ${passed} Passed | ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
