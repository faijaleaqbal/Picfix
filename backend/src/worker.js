'use strict';

const { Worker } = require('bullmq');
const fs = require('fs');
const fsp = require('fs/promises');
const config = require('./config');
const {
  AI_QUEUE_NAME,
  isTransientFetchError,
  resultPathFor,
} = require('./services/queue.service');
const { getSharedRedis } = require('./utils/redisClient');

/**
 * AI job processor: forwards the uploaded file to the Python FastAPI
 * microservice. Concurrency is capped at AI_WORKER_CONCURRENCY (2 on a
 * 2-vCPU box) — everything else waits in the BullMQ queue.
 *
 * Timeout is enforced inline (AbortController, AI_JOB_TIMEOUT_MS) and
 * timeouts fail immediately with AI_TIMEOUT — no BullMQ-level retry,
 * because a retry would re-run a known-slow request and double the
 * user's wait. Only transient transport errors (ECONNRESET etc.) are
 * retried up to AI_JOB_MAX_RETRIES with short backoff.
 */

function httpError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function timeoutError() {
  return httpError(504, 'AI service timed out. Please retry.', 'AI_TIMEOUT');
}

async function callAiServiceOnce(job) {
  const { endpoint, filePath, originalName } = job.data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.aiJobTimeoutMs);
  try {
    const fileData = await fsp.readFile(filePath);
    const blob = new Blob([fileData], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append('image', blob, originalName || 'image');

    const response = await fetch(`${config.aiServiceUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = `AI service error (HTTP ${response.status})`;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        try {
          const text = await response.text();
          if (text) detail = text.slice(0, 300);
        } catch { /* keep default */ }
      }
      throw httpError(response.status, detail, 'AI_SERVICE_ERROR');
    }

    if (endpoint === '/remove-background') {
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length) throw httpError(502, 'AI service returned empty result', 'AI_EMPTY_RESULT');
      const outPath = resultPathFor(job.id, originalName);
      await fsp.writeFile(outPath, buffer);
      return { kind: 'binary', resultUrl: `/api/ai/jobs/${job.id}/result`, sizeBytes: buffer.length };
    }

    const data = await response.json();
    return { kind: 'json', payload: data };
  } finally {
    clearTimeout(timer);
  }
}

async function processJob(job) {
  const maxAttempts = 1 + Math.max(0, config.aiJobMaxRetries);
  const RETRYABLE = (err) =>
    isTransientFetchError(err) ||
    (err && typeof err.status === 'number' && err.status >= 500 && err.status < 504);

  try {
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await callAiServiceOnce(job);
      } catch (err) {
        lastErr = err;
        if (err && err.name === 'AbortError') {
          throw timeoutError();
        }
        if (attempt < maxAttempts && RETRYABLE(err)) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        break;
      }
    }
    throw lastErr;
  } finally {
    fs.unlink(job.data.filePath, () => {});
  }
}

async function startAiWorker() {
  const connection = getSharedRedis('worker');
  const worker = new Worker(AI_QUEUE_NAME, processJob, {
    connection,
    concurrency: config.aiWorkerConcurrency,
    // BullMQ-level retry disabled — handled inline above
    settings: {},
  });

  worker.on('error', (err) => {
    console.error(`[worker] ${err.message}`);
  });

  worker.on('completed', (job) => {
    console.log(`[worker] job ${job.id} completed (${job.data.endpoint})`);
  });

  worker.on('failed', (job, err) => {
    console.warn(`[worker] job ${job && job.id} failed: ${err.code || err.name || 'ERROR'} ${err.message}`);
  });

  console.log(`[worker] AI worker started (queue=${AI_QUEUE_NAME}, concurrency=${config.aiWorkerConcurrency}, timeout=${config.aiJobTimeoutMs}ms)`);
  return worker;
}

module.exports = { startAiWorker, processJob };
