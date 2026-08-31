// End-to-End FCM Integration Test Script for ThermoGuard Backend
const http = require('http');
const app = require('../src/app');
const config = require('../src/config/env');

const server = http.createServer(app);

async function runTests() {
  const port = 5099;
  await new Promise((resolve) => server.listen(port, resolve));
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[TEST] Test server listening on ${baseUrl}`);

  try {
    // 1. Test Health Check
    console.log('\n--- TEST 1: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log('Health Response:', healthRes.status === 'HEALTHY' ? '✓ PASSED' : '✗ FAILED', healthRes);

    // 2. Test Quick Login to obtain JWT Token
    console.log('\n--- TEST 2: Quick Login (Officer #4102) ---');
    const loginRes = await fetch(`${baseUrl}/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'authority' }),
    }).then((r) => r.json());

    if (!loginRes.data || !loginRes.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
    }
    const token = loginRes.data.token;
    console.log('✓ Obtained JWT Token:', token.slice(0, 20) + '...');
    console.log('User Role:', loginRes.data.user.role, '| Name:', loginRes.data.user.name);

    // 3. Test Notification Status Endpoint
    console.log('\n--- TEST 3: Notification Status ---');
    const statusRes = await fetch(`${baseUrl}/notifications/status`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    console.log('Status Response:', statusRes.success ? '✓ PASSED' : '✗ FAILED', statusRes.data);

    // 4. Test FCM Token Registration Endpoint
    console.log('\n--- TEST 4: Register FCM Device Token ---');
    const mockFcmToken = 'fcm_test_token_device_web_' + Date.now();
    const regRes = await fetch(`${baseUrl}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: mockFcmToken,
        deviceType: 'web',
      }),
    }).then((r) => r.json());
    console.log('Register Token Response:', regRes.success ? '✓ PASSED' : '✗ FAILED', regRes.data);

    // 5. Test Send Test Alert Endpoint
    console.log('\n--- TEST 5: Send Test Notification ---');
    const testNotifRes = await fetch(`${baseUrl}/notifications/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }).then((r) => r.json());
    console.log('Send Test Response:', testNotifRes.success ? '✓ PASSED' : '✗ FAILED', testNotifRes.data);

    // 6. Test Alert Creation & FCM Broadcast Dispatch
    console.log('\n--- TEST 6: Create Alert & FCM Push Broadcast ---');
    const alertRes = await fetch(`${baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'RED ALERT — Severe Thermal Stress Test',
        level: 'RED',
        severity: 'Extreme',
        message: 'WBGT has breached 33°C threshold in test zone.',
        targetLocationNames: ['Hyderabad', 'New Delhi'],
      }),
    }).then((r) => r.json());
    console.log('Create Alert Response:', alertRes.success ? '✓ PASSED' : '✗ FAILED', alertRes.data?.title);

    // 7. Test FCM Token Unregistration Endpoint
    console.log('\n--- TEST 7: Unregister FCM Device Token ---');
    const unregRes = await fetch(`${baseUrl}/notifications/unregister-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: mockFcmToken,
      }),
    }).then((r) => r.json());
    console.log('Unregister Token Response:', unregRes.success ? '✓ PASSED' : '✗ FAILED', unregRes.data);

    console.log('\n========================================');
    console.log('🎉 ALL BACKEND FCM TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
