import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Trust Proxy Configuration (P4-1)', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    delete process.env.TRUST_PROXY_SUBNET;
    delete process.env.TRUST_PROXY;
    delete require.cache[require.resolve('../../src/config')];
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete require.cache[require.resolve('../../src/config')];
  });

  it('reads TRUST_PROXY_SUBNET from environment', () => {
    process.env.TRUST_PROXY_SUBNET = '172.20.0.0/16';
    const config = require('../../src/config');
    expect(config.trustProxySubnet).toBe('172.20.0.0/16');
  });

  it('preserves legacy trustProxy boolean for backward compat', () => {
    process.env.TRUST_PROXY = '1';
    const config = require('../../src/config');
    expect(config.trustProxy).toBe(true);
  });
});

describe('Rate Limiter Configuration', () => {
  it('has aiRateLimit and lightRateLimit sub-objects', () => {
    const config = require('../../src/config');
    expect(config.aiRateLimit).toBeDefined();
    expect(config.aiRateLimit.max).toBeGreaterThan(0);
    expect(config.aiRateLimit.windowMs).toBeGreaterThan(0);
    expect(config.lightRateLimit).toBeDefined();
    expect(config.lightRateLimit.max).toBeGreaterThan(0);
    expect(config.lightRateLimit.windowMs).toBeGreaterThan(0);
  });
});

describe('Worker Configuration', () => {
  it('has required worker config fields', () => {
    const config = require('../../src/config');
    expect(config.aiWorkerConcurrency).toBeGreaterThan(0);
    expect(config.aiJobTimeoutMs).toBeGreaterThan(0);
    expect(config.aiJobMaxRetries).toBeGreaterThanOrEqual(0);
    expect(config.aiJobResultTtlSeconds).toBeGreaterThan(0);
    expect(config.aiQueueMaxWaiting).toBeGreaterThan(0);
  });
});

describe('Server Health', () => {
  it('has a worker entrypoint (P4-2)', () => {
    const worker = require('../../src/worker');
    expect(typeof worker.startAiWorker).toBe('function');
    expect(typeof worker.processJob).toBe('function');
  });

  it('exports logger functions for observability', () => {
    const logger = require('../../src/utils/logger');
    expect(typeof logger.logInfo).toBe('function');
    expect(typeof logger.logWarn).toBe('function');
    expect(typeof logger.logError).toBe('function');
  });
});