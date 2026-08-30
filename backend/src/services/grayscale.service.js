'use strict';

const sharp = require('sharp');

/** Grayscale (saturation 0) */
async function grayscaleImage({ input }) {
  return sharp(input, { sequentialRead: true })
    .rotate()
    .grayscale()
    .toBuffer({ resolveWithObject: true });
}

module.exports = { grayscaleImage };
