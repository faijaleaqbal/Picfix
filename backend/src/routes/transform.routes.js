'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { rotate, flip } = require('../controllers/transform.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/rotate', upload, asyncHandler(rotate));
router.post('/flip', upload, asyncHandler(flip));

module.exports = router;
