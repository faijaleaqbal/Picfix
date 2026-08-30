'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const social = require('../controllers/social.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

// List available social presets
router.get('/social-resize/presets', social.listPresets);

router.post('/social-resize', upload, asyncHandler(social.socialResize));

module.exports = router;
