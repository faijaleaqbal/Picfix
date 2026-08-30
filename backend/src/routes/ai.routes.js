'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { asyncHandler } = require('../utils/asyncHandler');
const { enqueueAi, jobStatus, jobResult } = require('../controllers/ai.controller');
const { aiRateLimit, lightRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const upload = createUpload('image');

// Submission endpoints: strict AI limit (default 10 / 10 min / IP).
// Status/result polling is NOT limited by the AI limiter — polling is free.
router.post('/remove-background', aiRateLimit, upload, (req, res, next) => {
  req.endpoint = '/remove-background';
  next();
}, asyncHandler(enqueueAi));

router.post('/ocr', aiRateLimit, upload, (req, res, next) => {
  req.endpoint = '/ocr';
  next();
}, asyncHandler(enqueueAi));

router.post('/detect-face', aiRateLimit, upload, (req, res, next) => {
  req.endpoint = '/detect-face';
  next();
}, asyncHandler(enqueueAi));

// Job status + result — only basic abuse protection (100/hr/IP).
router.get('/jobs/:jobId', lightRateLimit, asyncHandler(jobStatus));
router.get('/jobs/:jobId/result', lightRateLimit, asyncHandler(jobResult));

module.exports = router;
