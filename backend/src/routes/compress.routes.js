'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { compress } = require('../controllers/compress.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/compress', upload, asyncHandler(compress));

module.exports = router;
