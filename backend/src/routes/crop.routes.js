'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { crop } = require('../controllers/crop.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/crop', upload, asyncHandler(crop));

module.exports = router;
