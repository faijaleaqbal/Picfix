'use strict';

const config = require('../config');

/**
 * CORS middleware.
 *
 * - Allowed origins come from config.corsOrigins (CORS_ORIGIN /
 *   CORS_ORIGINS / CORS_ORIGIN_PROD env vars; falls back to the
 *   Next.js dev server on localhost:3000).
 * - Exposes the binary-response metadata headers so the browser
 *   frontend can read them from fetch(): X-Output-Size, X-Quality-Used,
 *   X-DPI, Content-Disposition.
 * - Allows the multipart/form-data content type browsers send with FormData.
 */

const EXPOSE_HEADERS = [
  'Content-Length',
  'Content-Type',
  'Content-Disposition',
  'X-Output-Size',
  'X-Quality-Used',
  'X-DPI',
];

function isAllowed(origin) {
  if (!origin) return true; // curl / same-origin / health checks
  return config.corsOrigins.includes(origin);
}

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && isAllowed(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Credentials', 'true');
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
  res.set('Access-Control-Expose-Headers', EXPOSE_HEADERS.join(', '));
  res.set('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
}

module.exports = { corsMiddleware };
