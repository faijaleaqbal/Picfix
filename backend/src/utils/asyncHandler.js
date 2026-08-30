'use strict';

/**
 * Express 4 does not catch async route errors — wrap every async
 * controller so rejections reach the central error handler.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
