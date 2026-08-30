'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { resize } = require('../controllers/resize.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/resize', upload, asyncHandler(resize));

module.exports = router;
