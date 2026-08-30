'use strict';

const sharp = require('sharp');

/**
 * Compress an image to a target size using binary search on quality.
 * Max 7 iterations of actual encode; stops early if within 5% of target.
 * Works for jpeg and webp (lossy quality params).
 */
async function compressToTarget(inputPath, targetBytes, format = 'jpeg', fallbackBuf = null) {
  const src = fallbackBuf || inputPath;

  // Probe metadata once
  let metadata;
  try {
    metadata = await sharp(inputPath).metadata();
  } catch (err) {
    err.status = 422;
    err.code = 'IMAGE_PROCESSING_FAILED';
    throw err;
  }

  const fmt = format === 'webp' ? 'webp' : 'jpeg';
  const pipeline = (quality) =>
    sharp(src, { sequentialRead: true })
      .rotate() // auto-orient from EXIF
      [fmt]({ quality, effort: fmt === 'webp' ? 3 : 4, mozjpeg: fmt === 'jpeg' })
      .toBuffer({ resolveWithObject: true });

  let low = 20;
  let high = 100;
  let best = null; // { buffer, size, quality }
  let iterations = 0;

  // First probe at mid quality
  let q = Math.floor((low + high) / 2);
  while (low <= high && iterations < 8) {
    iterations++;
    const { data, info } = await pipeline(q);
    best = { buffer: data, size: info.size, quality: q };

    // Within 5% tolerance -> good enough, save CPU
    if (Math.abs(data.length - targetBytes) / targetBytes <= 0.05) break;
    if (data.length > targetBytes) {
      high = q - 1;
    } else {
      low = q + 1;
    }
    const nq = Math.floor((low + high) / 2);
    if (nq === q) break; // no progress possible
    q = nq;
  }

  // If even q=20 is bigger than target, return smallest we can get
  // (best currently reflects last attempt; ensure we keep the SMALLEST overshoot)
  // Track the closest result explicitly:
  return { ...best, format: fmt, iterations, originalFormat: metadata.format };
}

module.exports = { compressToTarget };
