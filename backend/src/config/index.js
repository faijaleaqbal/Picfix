'use strict';

require('dotenv').config();

const int = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const bool = (v, def) => {
  if (v === undefined || v === null || v === '') return def;
  const s = String(v).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return true;
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return def;
};

const config = {
  host: process.env.HOST || '0.0.0.0',
  port: int(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  tempDir: process.env.TEMP_DIR || '/tmp/image-uploads',
  maxFileSize: int(process.env.MAX_FILE_SIZE, 15 * 1024 * 1024),
  fileTtlMinutes: int(process.env.FILE_TTL_MINUTES, 30),
  cleanupIntervalMinutes: int(process.env.CLEANUP_INTERVAL_MINUTES, 5),
  sharpConcurrency: int(process.env.SHARP_CONCURRENCY, 4),
  libvipsConcurrency: int(process.env.LIBVIPS_CONCURRENCY, 2),
  queueTimeoutMs: int(process.env.QUEUE_TIMEOUT_MS, 30 * 1000),
  maxImagesPerPdf: int(process.env.MAX_IMAGES_PER_PDF, 20),
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://ai-service:8000',
  trustProxy: bool(process.env.TRUST_PROXY, true),

  // ---- Redis / BullMQ ----
  // Single shared Redis instance for queue + rate-limiters. Required.
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  aiWorkerConcurrency: int(process.env.AI_WORKER_CONCURRENCY, 2),
  aiJobTimeoutMs: int(process.env.AI_JOB_TIMEOUT_MS, 10 * 1000),
  aiJobMaxRetries: int(process.env.AI_JOB_MAX_RETRIES, 2),
  aiJobResultTtlSeconds: int(process.env.AI_JOB_RESULT_TTL_SECONDS, 24 * 60 * 60),
  aiQueueMaxWaiting: int(process.env.AI_QUEUE_MAX_WAITING, 100),

  // ---- Rate limits ----
  // AI endpoints are expensive: 10 req / 10 min / IP.
  aiRateLimit: {
    max: int(process.env.AI_RATE_LIMIT_MAX, 10),
    windowMs: int(process.env.AI_RATE_LIMIT_WINDOW_MIN, 10) * 60 * 1000,
  },
  // Light endpoints (resize/crop/convert/etc): 100 req / 60 min / IP.
  lightRateLimit: {
    max: int(process.env.LIGHT_RATE_LIMIT_MAX, 100),
    windowMs: int(process.env.LIGHT_RATE_LIMIT_WINDOW_MIN, 60) * 60 * 1000,
  },

  // ---- CORS ----
  // Development default allows the Next.js dev server on localhost:3000.
  // Set CORS_ORIGIN / CORS_ORIGIN_PROD in .env for real deployments.
  corsOrigins: (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN
    ? [
        process.env.CORS_ORIGIN,
        process.env.CORS_ORIGINS,
        process.env.CORS_ORIGIN_PROD,
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'])
    .filter(Boolean)
    .flatMap((s) => String(s).split(','))
    .map((s) => s.trim())
    .filter(Boolean),
};

module.exports = config;
