'use strict';

const sharp = require('sharp');

const UNIT_TO_INCH = {
  px: (v) => v,
  inch: (v) => v,
  in: (v) => v,
  cm: (v) => v / 2.54,
  mm: (v) => v / 25.4,
};

/** Convert a dimension in a unit to pixels at a given DPI */
function unitToPx(value, unit, dpi) {
  const conv = UNIT_TO_INCH[unit];
  if (!conv) return null;
  if (unit === 'px') return Math.round(value);
  return Math.round(conv(value) * dpi);
}

/**
 * Resize with px/cm/mm/inch units and aspect-ratio control.
 * fit: 'cover' | 'contain' | 'inside' | 'outside' | 'fill'
 */
async function resizeImage({ input, width, height, unit = 'px', dpi = 300, maintainAspectRatio = true, fit = 'cover', position = 'centre', format = null, background }) {
  const w = unitToPx(width, unit, dpi);
  const h = height !== undefined && height !== null && height !== ''
    ? unitToPx(height, unit, dpi)
    : null;

  let pipeline = sharp(input, { sequentialRead: true }).rotate();

  if (maintainAspectRatio) {
    const opts = { fit, position };
    if (background) opts.background = background;
    pipeline = h !== null
      ? pipeline.resize(w, h, opts)
      : pipeline.resize(w, null, { fit: 'inside' }); // height omitted -> scale proportionally
  } else {
    if (h === null) throw new Error('height is required when maintainAspectRatio=false');
    pipeline = pipeline.resize(w, h, { fit: 'fill' });
  }

  if (format) pipeline = pipeline.toFormat(format);
  return pipeline.toBuffer({ resolveWithObject: true });
}

module.exports = { resizeImage, unitToPx, UNIT_TO_INCH };
