'use strict';

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const config = require('../config');
const { getSharedRedis } = require('../utils/redisClient');

/**
 * Redis-backed per-IP rate limiters. If Redis is down, fall back to
 * express-rate-limit's in-memory store (per-process limits) and log a
 * one-time warning — endpoints keep working, abuse protection degrades
 * but never blocks startup.
 */

let redisWarned = false;
let redisHealthy = false;

function isRedisHealthy() {
  return redisHealthy;
}

function markRedisUnhealthy(scope) {
  if (redisHealthy) {
    redisHealthy = false;
    if (!redisWarned) {
      console.warn(`[rateLimit] Redis unavailable — falling back to in-memory limiter (limits reset per process) [${scope}]`);
      redisWarned = true;
    }
  }
}

function markRedisHealthy() {
  redisHealthy = true;
}

function retryAfterHandler(req, res) {
  const reset = req.rateLimit && req.rateLimit.resetTime;
  const retryAfter = Math.max(1, Math.ceil((new Date(reset).getTime() - Date.now()) / 1000));
  res.set('Retry-After', String(retryAfter));
  res.status(429).json({
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMITED',
    retryAfterSeconds: retryAfter,
  });
}

function makeLimiter({ max, windowMs, name }) {
  let limiter;
  let store = null;
  try {
    const client = getSharedRedis('ratelimit');
    store = new RedisStore({
      sendCommand: async (...args) => {
        markRedisHealthy();
        return client.call(...args);
      },
      prefix: `rl:${name}:`,
    });
  } catch (err) {
    markRedisUnhealthy(name);
  }

  const base = {
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
    handler: retryAfterHandler,
    store,
  };

  limiter = rateLimit(base);
  return limiter;
}

const aiRateLimit = makeLimiter({
  max: config.aiRateLimit.max,
  windowMs: config.aiRateLimit.windowMs,
  name: 'ai',
});

const lightRateLimit = makeLimiter({
  max: config.lightRateLimit.max,
  windowMs: config.lightRateLimit.windowMs,
  name: 'light',
});

module.exports = { aiRateLimit, lightRateLimit, isRedisHealthy };
