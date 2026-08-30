'use strict';

const BullMQ = require('bullmq');
const { Queue } = BullMQ;
const config = require('../config');
const { getSharedRedis } = require('../utils/redisClient');

const AI_QUEUE_NAME = 'ai-jobs';

// Binary results live on disk max 30 min (privacy policy) even though
// job records stay in Redis for AI_JOB_RESULT_TTL_SECONDS.
const FILE_TTL_MS = Math.min(config.fileTtlMinutes, 30) * 60 * 1000;

const TRANSIENT_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'EAI_AGAIN', 'ENOTFOUND', 'ETIMEDOUT']);

function isTransientFetchError(err) {
  const code = err && (err.code || (err.cause && err.cause.code));
  if (code && TRANSIENT_CODES.has(code)) return true;
  if (err && err.name === 'AbortError') return false;
  if (err && err.name === 'TimeoutError') return false;
  return false;
}

let queue = null;
let queueAvailable = false;

async function ensureQueue() {
  if (queue) return queue;
  const connection = getSharedRedis('queue');
  queue = new Queue(AI_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      // Retries are handled inline in the worker processor (transient
      // errors only). Queue-level retries would re-run deleted files.
      attempts: 1,
      removeOnComplete: { age: config.aiJobResultTtlSeconds, count: 1000 },
      removeOnFail: { age: config.aiJobResultTtlSeconds, count: 1000 },
    },
  });
  try {
    await queue.client;
    queueAvailable = true;
  } catch (err) {
    queueAvailable = false;
    console.warn(`[queue] Redis unavailable — AI features degraded: ${err.message}`);
  }
  return queue;
}

async function enqueueAiJob(data) {
  const q = await ensureQueue();
  if (!queueAvailable) {
    const err = new Error('AI features temporarily unavailable, please try again later');
    err.status = 503;
    err.code = 'AI_UNAVAILABLE';
    throw err;
  }
  const counts = await q.getJobCounts('wait', 'paused', 'delayed', 'active');
  const waiting = (counts.wait || 0) + (counts.paused || 0) + (counts.delayed || 0);
  if (waiting >= config.aiQueueMaxWaiting) {
    const err = new Error(`AI queue is full (over ${config.aiQueueMaxWaiting} waiting). Please try again shortly`);
    err.status = 503;
    err.code = 'QUEUE_FULL';
    throw err;
  }
  const job = await q.add('ai', data, { expireAfter: config.aiJobResultTtlSeconds * 1000 });
  return job;
}

async function getJob(jobId) {
  const q = await ensureQueue();
  if (!queueAvailable) {
    const err = new Error('AI features temporarily unavailable, please try again later');
    err.status = 503;
    err.code = 'AI_UNAVAILABLE';
    425;
    throw err;
  }
  const job = await q.getJob(jobId);
  if (!job) return null;
  return job;
}

function isQueueAvailable() {
  return queueAvailable;
}

function resultPathFor(jobId, originalName) {
  const path = require('path');
  const fs = require('fs');
  const dir = path.join(config.tempDir, 'ai-results');
  fs.mkdirSync(dir, { recursive: true });
  const safeStem = String(originalName || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 40) || 'image';
  return path.join(dir, `${jobId}-${safeStem}.png`);
}

function aiFileTtlMs() {
  return FILE_TTL_MS;
}

module.exports = {
  AI_QUEUE_NAME,
  ensureQueue,
  enqueueAiJob,
  getJob,
  isQueueAvailable,
  isTransientFetchError,
  resultPathFor,
  aiFileTtlMs,
};
