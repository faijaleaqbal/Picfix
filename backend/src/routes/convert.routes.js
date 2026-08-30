'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const { convert } = require('../controllers/convert.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

router.post('/convert-format', upload, asyncHandler(convert));

module.exports = router;
