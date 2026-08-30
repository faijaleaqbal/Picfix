'use strict';

const sharp = require('sharp');

/**
 * Rotate: 90/180/270 exact; arbitrary angle expands canvas with
 * configurable background (default transparent -> PNG output).
 */
async function rotateImage({ input, degrees, background = { r: 0, g: 0, b: 0, alpha: 0 } }) {
  const norm = ((degrees % 360) + 360) % 360;
  const exact = [0, 90, 180, 270];

  let pipeline = sharp(input, { sequentialRead: true });

  if (exact.includes(norm)) {
    if (norm !== 0) pipeline = pipeline.rotate(norm, { background });
    return pipeline.toBuffer({ resolveWithObject: true });
  }

  // Arbitrary angle -> canvas grows, transparent or solid background
  const hasAlpha = background.alpha > 0 || background.alpha === 0;
  const useTransparent = !background || background.alpha === 0;
  const out = useTransparent ? 'png' : 'jpeg';

  return pipeline
    .rotate(degrees, { background })
    .toFormat(out === 'png' ? 'png' : 'jpeg', useTransparent ? {} : { quality: 92, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
}

async function flipImage({ input, direction }) {
  const pipeline = direction === 'vertical' ? 'flip' : 'flop';
  return sharp(input, { sequentialRead: true })[pipeline]().toBuffer({ resolveWithObject: true });
}

module.exports = { rotateImage, flipImage };
