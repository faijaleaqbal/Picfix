'use strict';

/**
 * Shared HTTP response helpers — binary image responses everywhere,
 * consistent headers across all endpoints.
 */
const path = require('path');

const FORMAT_HEADERS = {
  jpeg: { 'Content-Type': 'image/jpeg', ext: 'jpg' },
  jpg: { 'Content-Type': 'image/jpeg', ext: 'jpg' },
  png: { 'Content-Type': 'image/png', ext: 'png' },
  webp: { 'Content-Type': 'image/webp', ext: 'webp' },
  tiff: { 'Content-Type': 'image/tiff', ext: 'tiff' },
  avif: { 'Content-Type': 'image/avif', ext: 'avif' },
  pdf: { 'Content-Type': 'application/pdf', ext: 'pdf' },
};

function sendBinary(res, buffer, format, { filename = 'output', size, quality, dpi } = {}) {
  const meta = FORMAT_HEADERS[format] || FORMAT_HEADERS.png;
  res.set({
    'Content-Type': meta['Content-Type'],
    'Content-Disposition': `attachment; filename="${filename}.${meta.ext}"`,
    'Content-Length': buffer.length,
    'Cache-Control': 'no-store',
  });
  if (size !== undefined) res.set('X-Output-Size', String(size));
  if (quality !== undefined) res.set('X-Quality-Used', String(quality));
  if (dpi !== undefined) res.set('X-DPI', String(dpi));
  res.end(buffer);
}

function originalStem(originalname) {
  const ext = path.extname(originalname || '');
  return path.basename(originalname || 'image', ext);
}

module.exports = { sendBinary, originalStem, FORMAT_HEADERS };
