'use strict';

require('dotenv').config();

const http = require('node:http');
const crypto = require('node:crypto');
const { app } = require('../src/app');
const { resetCallCount, getCallCount } = require('../src/eventHandlers');
const { _processedIds } = require('../src/webhookHandler');

const SECRET = process.env.WEBHOOK_SECRET || 'testsecret';
const PORT = 3097;

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}\n    ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function makeBody(overrides = {}) {
  return JSON.stringify({
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    type: 'payment.succeeded',
    data: { amount: 2000 },
    ...overrides,
  });
}

function sign(body) {
  return 'sha256=' + crypto
    .createHmac('sha256', SECRET)
    .update(Buffer.from(body))
    .digest('hex');
}

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': data.length } : {}),
        ...headers,
      },
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));

  resetCallCount();
  _processedIds.clear();

  const body = makeBody();
  const signature = sign(body);

  console.log('\nTest 1: Valid webhook returns 200');
  await test('Valid signature → 200 received', async () => {
    const response = await request('POST', '/webhooks', body, {
      'x-webhook-signature': signature,
    });
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(response.body.status === 'received', `Expected received, got ${response.body.status}`);
  });

  await wait(50);

  console.log('\nTest 2: Forged signature returns 401');
  await test('Forged signature → 401 Invalid signature', async () => {
    const badSignature = 'sha256=' + '0'.repeat(64);
    const response = await request('POST', '/webhooks', body, {
      'x-webhook-signature': badSignature,
    });
    assert(response.status === 401, `Expected 401, got ${response.status}`);
  });

  console.log('\nTest 3: Missing signature header returns 401');
  await test('No signature header → 401', async () => {
    const response = await request('POST', '/webhooks', body);
    assert(response.status === 401, `Expected 401, got ${response.status}`);
  });

  console.log('\nTest 4: Replaying the same event id returns 200 without re-processing');
  await test('Duplicate event id → 200 already_processed', async () => {
    const countBefore = getCallCount();
    const response = await request('POST', '/webhooks', body, {
      'x-webhook-signature': signature,
    });
    await wait(50);
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(response.body.status === 'already_processed', `Expected already_processed, got ${response.body.status}`);
    assert(getCallCount() === countBefore, 'handleEvent must not run again for a duplicate');
  });

  console.log('\nTest 5: New event id is processed and added to processedIds');
  await test('New event id → handleEvent called, id stored', async () => {
    const newBody = makeBody({ id: 'evt_unique_new' });
    const newSignature = sign(newBody);
    const countBefore = getCallCount();
    await request('POST', '/webhooks', newBody, {
      'x-webhook-signature': newSignature,
    });
    await wait(50);
    assert(getCallCount() === countBefore + 1, 'Expected handleEvent to run once');
    assert(_processedIds.has('evt_unique_new'), 'Expected event id in processedIds');
  });

  await new Promise((resolve) => server.close(resolve));

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('All tests passed! ✓');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
