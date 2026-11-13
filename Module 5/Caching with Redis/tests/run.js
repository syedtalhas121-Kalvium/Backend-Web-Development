'use strict';

require('dotenv').config();

const http = require('node:http');
const { app } = require('../src/app');

const PORT = 3096;
let passed = 0, failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (err) { console.log(`  ✗ ${name}\n    ${err.message}`); failed++; }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost', port: PORT, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  try {
    const { cacheDel } = require('../src/cache');
    await cacheDel('feed:trending');
  } catch {}

  const server = http.createServer(app);
  await new Promise(r => server.listen(PORT, r));

  let missMs, hitMs;

  console.log('\nTest 1: GET /feed returns 200 with data');
  await test('GET /feed returns 200 with a data array', async () => {
    const t0 = Date.now();
    const res = await request('GET', '/feed');
    missMs = Date.now() - t0;
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), `Expected array, got ${JSON.stringify(res.body)}`);
    assert(res.body.length > 0, 'Expected at least one post');
  });

  await wait(50);

  console.log('\nTest 2: Second GET /feed returns X-Cache: HIT');
  await test('Second GET /feed is served from cache (X-Cache: HIT)', async () => {
    const t0 = Date.now();
    const res = await request('GET', '/feed');
    hitMs = Date.now() - t0;
    assert(res.headers['x-cache'] === 'HIT', `Expected X-Cache: HIT, got ${res.headers['x-cache']}`);
  });

  console.log('\nTest 3: Cache hit is faster than cache miss');
  await test('Hit response time < miss response time', () => {
    assert(hitMs < missMs, `Expected hit (${hitMs}ms) faster than miss (${missMs}ms)`);
    assert(hitMs < 30, `Expected hit under 30ms, got ${hitMs}ms`);
    console.log(`    miss: ${missMs}ms  →  hit: ${hitMs}ms`);
  });

  console.log('\nTest 4: POST /posts invalidates the cache');
  await test('Next GET /feed after POST /posts returns X-Cache: MISS', async () => {
    await request('POST', '/posts', { title: 'Cache Invalidation Test' });
    await wait(50);
    const res = await request('GET', '/feed');
    assert(res.headers['x-cache'] === 'MISS', `Expected MISS after POST, got ${res.headers['x-cache']}`);
  });

  await wait(50);

  console.log('\nTest 5: Feed re-populates cache after invalidation');
  await test('GET /feed after invalidation miss returns X-Cache: HIT on next request', async () => {
    const res = await request('GET', '/feed');
    assert(res.headers['x-cache'] === 'HIT', `Expected HIT, got ${res.headers['x-cache']}`);
  });

  try {
    const { cacheDel } = require('../src/cache');
    await cacheDel('feed:trending');
  } catch {}

  await new Promise(r => server.close(r));
  try {
    const cache = require('../src/cache');
    if (cache.redis && typeof cache.redis.quit === 'function') await cache.redis.quit();
  } catch {}

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('All tests passed! ✓');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
