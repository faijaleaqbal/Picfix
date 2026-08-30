'use strict';

const config = require('../config');
const { ApiError } = require('../middleware/validate');

/**
 * Central error handler. Every error response is JSON:
 * { "error": string, "code": string }
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Unexpected server error';

  // Multer-specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 400;
      code = 'FILE_TOO_LARGE';
      message = `File too large. Max allowed size is ${Math.round(config.maxFileSize / (1024 * 1024))}MB`;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      status = 400;
      code = 'TOO_MANY_FILES';
      message = `Too many files. Max is ${config.maxImagesPerPdf}`;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      status = 400;
      code = 'INVALID_PARAM';
      message = `Unexpected file field: "${err.field}". Check the field name in the docs.`;
    } else {
      status = 400;
      code = 'INVALID_PARAM';
      message = `Upload error: ${err.message}`;
    }
  }

  // Sharp / libvips errors
  if (status === 500 && /sharp|libvips|vips/i.test(String(err.message))) {
    message = 'Image processing failed. The file may be corrupted or in an unsupported format.';
    code = 'IMAGE_PROCESSING_FAILED';
    status = 422;
  }

  if (status === 500) {
    console.error('[error]', err);
    message = 'Internal server error';
  }

  res.status(status).json({ error: message, code });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}`, code: 'NOT_FOUND' });
}

module.exports = { errorHandler, notFoundHandler };
