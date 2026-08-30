'use strict';

const sharp = require('sharp');
const util = require('util');
const heicConvert = util.promisify(require('heic-convert'));

const SHARP_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'tiff', 'avif']);

/**
 * Convert format. Sharp handles jpg/png/webp/tiff/avif natively.
 * HEIC input -> decode via heic-convert to a buffer, then run through
 * Sharp for any output processing.
 */
async function convertFormat({ input, target, quality = 90 }) {
  const t = target.toLowerCase();
  if (!SHARP_FORMATS.has(t)) {
    const err = new Error(`Unsupported target format "${target}". Supported: ${[...SHARP_FORMATS].join(', ')}`);
    err.status = 400;
    err.code = 'INVALID_PARAM';
    throw err;
  }

  // Detect HEIC input regardless of target
  let pipelineInput = input;
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch (err) {
    err.status = 422;
    err.code = 'IMAGE_PROCESSING_FAILED';
    throw err;
  }

  if (meta.format === 'heif' || meta.format === 'heic' || /heic|heif/i.test(String(meta.space || ''))) {
    // libvips (with heif support) should handle it; if not, fall back to heic-convert
    try {
      const test = await sharp(input).resize(1, 1).png().toBuffer();
      // libvips handled it fine
      pipelineInput = input;
    } catch {
      const buf = require('fs').readFileSync(input);
      const out = await heicConvert({ buffer: buf, format: 'PNG', quality: 0.95 });
      pipelineInput = out;
    }
  }

  let pipeline = sharp(pipelineInput, { sequentialRead: true }).rotate();

  switch (t) {
    case 'jpg':
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 8 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality, effort: 3 });
      break;
  }

  return pipeline.toBuffer({ resolveWithObject: true });
}

module.exports = { convertFormat, SHARP_FORMATS };
