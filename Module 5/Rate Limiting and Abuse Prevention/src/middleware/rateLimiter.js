'use strict';

const rateLimit = require('express-rate-limit');

// One shared limiter instance is mounted on login, register, and refresh.
// Count only failed attempts so successful authentication does not consume quota.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Multi-instance deployment note:
// The default MemoryStore keeps counters inside each Node.js process. Behind a
// load balancer, requests can land on different instances, each with an
// independent counter, so a client may effectively receive the limit once per
// instance. Install rate-limit-redis and configure a shared RedisStore, for
// example:
//   const { RedisStore } = require('rate-limit-redis');
//   store: new RedisStore({ sendCommand: (...args) => redis.call(...args) })
// All instances then read/update the same Redis-backed counters and enforce
// one cluster-wide limit instead of separate per-process limits.

module.exports = authLimiter;
