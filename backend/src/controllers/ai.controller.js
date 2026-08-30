'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const {
  enqueueAiJob,
  getJob,
  isQueueAvailable,
  resultPathFor,
} = require('../services/queue.service');

const ENDPOINTS = new Set(['/remove-background', '/ocr', '/detect-face']);

function apiError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

/** POST /api/ai/remove-background | /ocr | /detect-face → 202 { jobId, status, statusUrl } */
async function enqueueAi(req, res) {
  if (!req.file) throw apiError(400, 'Image file is required', 'MISSING_FILE');
  const endpoint = req.endpoint;
  if (!ENDPOINTS.has(endpoint)) throw apiError(404, 'Unknown AI endpoint', 'NOT_FOUND');

  const job = await enqueueAiJob({
    endpoint,
    filePath: req.file.path,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  res.status(202).json({
    jobId: job.id,
    status: 'queued',
    statusUrl: `/api/ai/jobs/${job.id}`,
  });
}

const STATE_MAP = {
  waiting: 'queued',
  delayed: 'queued',
  active: 'processing',
  completed: 'done',
  failed: 'failed',
};

async function jobStatus(req, res) {
  if (!isQueueAvailable()) throw apiError(503, 'AI features temporarily unavailable, please try again later', 'AI_UNAVAILABLE');
  const job = await getJob(req.params.jobId);
  if (!job) throw apiError(404, 'Job not found or expired', 'JOB_NOT_FOUND');

  const rawState = await job.getState();
  const state = STATE_MAP[rawState] || rawState;
  const body = { jobId: job.id, status: state };

  if (state === 'done') {
    const r = job.returnvalue || {};
    if (r.kind === 'json') {
      body.result = r.payload;
    } else if (r.kind === 'binary') {
      body.resultUrl = r.resultUrl;
      body.sizeBytes = r.sizeBytes;
    }
  } else if (state === 'failed') {
    const failedReason = job.failedReason || 'AI job failed';
    const isTimeout = /timed out|AbortError|TimeoutError|AI_TIMEOUT/i.test(failedReason);
    body.status = 'failed';
    body.error = isTimeout
      ? 'AI service timed out. Please retry.'
      : failedReason;
    body.code = isTimeout ? 'AI_TIMEOUT' : 'AI_JOB_FAILED';
    body.retryable = true;
  }

  res.json(body);
}

async function jobResult(req, res) {
  if (!isQueueAvailable()) throw apiError(503, 'AI features temporarily unavailable, please try again later', 'AI_UNAVAILABLE');
  const job = await getJob(req.params.jobId);
  if (!job) throw apiError(404, 'Job not found or expired', 'JOB_NOT_FOUND');

  const rawState = await job.getState();
  if (rawState !== 'completed') {
    throw apiError(404, `Result not ready (job is ${STATE_MAP[rawState] || rawState})`, rawState === 'failed' ? 'JOB_FAILED' : 'RESULT_NOT_READY');
  }
  const r = job.returnvalue || {};
  if (r.kind !== 'binary') {
    throw apiError(404, 'This job has no binary result', 'RESULT_NOT_FOUND');
  }

  const filePath = resultPathFor(job.id, job.data.originalName);
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      return res.status(404).json({ error: 'Result file not found or expired (results are kept 30 minutes)', code: 'RESULT_NOT_FOUND' });
    }
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': st.size,
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

module.exports = { enqueueAi, jobStatus, jobResult, ENDPOINTS };
