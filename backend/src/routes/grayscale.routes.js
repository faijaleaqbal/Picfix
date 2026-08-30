'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { grayscale } = require('../controllers/grayscale.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/grayscale', upload, asyncHandler(grayscale));

module.exports = router;
