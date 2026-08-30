'use strict';

const sharp = require('sharp');

/**
 * Crop to x/y/w/h rect. shape: null | 'square' | 'circle'.
 * circle -> PNG with transparency outside the circle (SVG mask composite).
 */
async function cropImage({ input, x = 0, y = 0, width, height, shape = null }) {
  let pipeline = sharp(input, { sequentialRead: true }).rotate(); // auto-orient EXIF first

  let w = width;
  let h = height;

  if (shape === 'square' || shape === 'circle') {
    const meta = await pipeline.metadata();
    w = Math.min(meta.width, meta.height);
    h = w;
    x = Math.floor((meta.width - w) / 2);
    y = Math.floor((meta.height - h) / 2);
  }

  if (!w || !h) {
    const err = new Error('Crop requires positive width and height');
    err.status = 400;
    err.code = 'INVALID_PARAM';
    throw err;
  }

  const cropped = pipeline.extract({
    left: x,
    top: y,
    width: w,
    height: h,
  });

  if (shape === 'circle') {
    const png = await cropped.png().toBuffer();
    const mask = Buffer.from(
      `<svg width="${w}" height="${h}"><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2}" fill="#fff"/></svg>`
    );
    return sharp(png)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer({ resolveWithObject: true });
  }

  return cropped.toBuffer({ resolveWithObject: true });
}

module.exports = { cropImage };
