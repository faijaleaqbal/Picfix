'use strict';

const express = require('express');
const config = require('../config');
const { createMultiUpload } = require('../middleware/upload');
const { imageToPdf } = require('../controllers/pdf.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createMultiUpload('images', config.maxImagesPerPdf);

router.post('/image-to-pdf', upload, asyncHandler(imageToPdf));

module.exports = router;
