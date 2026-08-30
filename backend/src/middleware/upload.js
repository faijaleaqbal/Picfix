'use strict';

const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure temp dir exists at module load
fs.mkdirSync(config.tempDir, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/svg+xml',
]);

const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff',
  '.avif', '.heic', '.heif', '.svg',
]);

const storage = multer.diskStorage({
  destination: config.tempDir,
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${id}${path.extname(file.originalname).toLowerCase() || ''}`);
  },
});

/**
 * Multer upload factory. Rejects non-image mime/extension and files
 * over MAX_FILE_SIZE with the standard { error, code } JSON shape.
 */
function createUpload(fieldName, maxCount = 1) {
  return multer({
    storage,
    limits: { fileSize: config.maxFileSize, files: maxCount + 1 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const ok = ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext);
      if (!ok) {
        const err = new Error('Only image files are allowed (jpeg, png, webp, gif, tiff, avif, heic, svg)');
        err.status = 400;
        err.code = 'INVALID_FILE_TYPE';
        return cb(err);
      }
      cb(null, true);
    },
  }).single(fieldName);
}

/** Multi-file variant for image-to-pdf */
function createMultiUpload(fieldName, maxCount) {
  return multer({
    storage,
    limits: { fileSize: config.maxFileSize, files: maxCount },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const ok = ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext);
      if (!ok) {
        const err = new Error('Only image files are allowed');
        err.status = 400;
        err.code = 'INVALID_FILE_TYPE';
        return cb(err);
      }
      cb(null, true);
    },
  }).array(fieldName, maxCount);
}

module.exports = { createUpload, createMultiUpload, ALLOWED_MIME, ALLOWED_EXT };
