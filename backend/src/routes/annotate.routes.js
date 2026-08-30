'use strict';

const express = require('express');
const multer = require('multer');
const config = require('../config');
const { watermark, addText } = require('../controllers/annotate.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Watermark needs EITHER "watermark" image OR "text" field.
// Use fields() to accept both an image and an optional watermark image.
const watermarkUpload = multer({
  dest: config.tempDir,
  limits: { fileSize: config.maxFileSize, files: 2 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/)/.test(file.mimetype) || /\.(jpe?g|png|webp|gif|tiff?|avif|heic|heif|svg)$/i.test(file.originalname);
    if (!ok) {
      const err = new Error('Only image files are allowed');
      err.status = 400;
      err.code = 'INVALID_FILE_TYPE';
      return cb(err);
    }
    cb(null, true);
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'watermark', maxCount: 1 },
]);

const textUpload = multer({
  dest: config.tempDir,
  limits: { fileSize: config.maxFileSize, files: 1 },
}).single('image');

router.post('/watermark', watermarkUpload, asyncHandler(watermark));
router.post('/add-text', textUpload, asyncHandler(addText));

module.exports = router;
