'use strict';

const sharp = require('sharp');
const { escapeXml } = require('../middleware/validate');

const ANCHORS = {
  'top-left': (bw, bh, ww, wh, m) => ({ left: m, top: m }),
  'top': (bw, bh, ww, wh, m) => ({ left: Math.floor((bw - ww) / 2), top: m }),
  'top-right': (bw, bh, ww, wh, m) => ({ left: bw - ww - m, top: m }),
  'left': (bw, bh, ww, wh, m) => ({ left: m, top: Math.floor((bh - wh) / 2) }),
  'center': (bw, bh, ww, wh, m) => ({ left: Math.floor((bw - ww) / 2), top: Math.floor((bh - wh) / 2) }),
  'right': (bw, bh, ww, wh, m) => ({ left: bw - ww - m, top: Math.floor((bh - wh) / 2) }),
  'bottom-left': (bw, bh, ww, wh, m) => ({ left: m, top: bh - wh - m }),
  'bottom': (bw, bh, ww, wh, m) => ({ left: Math.floor((bw - ww) / 2), top: bh - wh - m }),
  'bottom-right': (bw, bh, ww, wh, m) => ({ left: bw - ww - m, top: bh - wh - m }),
};

function resolveAnchor(position, bw, bh, ww, wh, margin = 0) {
  const fn = ANCHORS[position] || ANCHORS['bottom-right'];
  const r = fn(bw, bh, ww, wh, margin);
  return {
    left: Math.max(0, r.left),
    top: Math.max(0, r.top),
  };
}

/**
 * Composite a watermark image over the base image.
 * scale: watermark width as fraction of base width (e.g. 0.2 = 20%).
 */
async function watermarkWithImage({ input, watermarkPath, position = 'bottom-right', opacity = 0.7, scale = 0.2, margin = 10 }) {
  const base = sharp(input, { sequentialRead: true }).rotate();
  const meta = await base.metadata();
  const bw = meta.width;
  const bh = meta.height;

  const targetW = Math.max(1, Math.round(bw * scale));
  const wmBuffer = await sharp(watermarkPath)
    .resize({ width: targetW })
    .png()
    .toBuffer();

  const wmMeta = await sharp(wmBuffer).metadata();

  let overlay = wmBuffer;
  if (opacity < 1) {
    // Multiply alpha via composite with a black rect at (1-opacity)
    const alphaMask = await sharp(Buffer.from(`<svg width="${wmMeta.width}" height="${wmMeta.height}"><rect width="100%" height="100%" fill="#fff" fill-opacity="${opacity}"/></svg>`))
      .png()
      .toBuffer();
    overlay = await sharp(wmBuffer)
      .ensureAlpha()
      .composite([{ input: alphaMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  const { left, top } = resolveAnchor(position, bw, bh, wmMeta.width, wmMeta.height, margin);

  return base
    .composite([{ input: overlay, left, top }])
    .toBuffer({ resolveWithObject: true });
}

/**
 * Text watermark rendered as SVG overlay.
 */
async function watermarkWithText({ input, text, position = 'bottom-right', opacity = 0.7, fontSize = 48, color = '#ffffff', fontFamily = 'sans-serif', margin = 10 }) {
  const base = sharp(input, { sequentialRead: true }).rotate();
  const meta = await base.metadata();
  const bw = meta.width;
  const bh = meta.height;

  // Estimate text box (rough: 0.6*fontSize per char for sans-serif)
  const estW = Math.min(bw, Math.ceil(text.length * fontSize * 0.6) + fontSize);
  const estH = Math.ceil(fontSize * 1.3);

  const { left, top } = resolveAnchor(position, bw, bh, estW, estH, margin);

  const svg = Buffer.from(
    `<svg width="${bw}" height="${bh}">
      <text x="${left}" y="${top + fontSize}" font-family="${escapeXml(fontFamily)}"
        font-size="${fontSize}" fill="${escapeXml(color)}" fill-opacity="${opacity}">${escapeXml(text)}</text>
    </svg>`
  );

  return base
    .composite([{ input: svg }])
    .toBuffer({ resolveWithObject: true });
}

/**
 * add-text: absolute x/y or named anchor, hex color, weight.
 */
async function addText({ input, text, fontSize = 48, color = '#ffffff', x, y, position = null, fontWeight = 'normal', fontFamily = 'sans-serif', opacity = 1 }) {
  const base = sharp(input, { sequentialRead: true }).rotate();
  const meta = await base.metadata();
  const bw = meta.width;
  const bh = meta.height;

  const estW = Math.ceil(text.length * fontSize * 0.6);
  const estH = Math.ceil(fontSize * 1.3);

  let left;
  let top;
  if (x !== undefined || y !== undefined) {
    left = Math.max(0, Math.min(bw, x || 0));
    top = Math.max(0, Math.min(bh, y || 0));
  } else {
    const r = resolveAnchor(position || 'top-left', bw, bh, estW, estH, 10);
    left = r.left;
    top = r.top;
  }

  const svg = Buffer.from(
    `<svg width="${bw}" height="${bh}">
      <text x="${left}" y="${top + fontSize}" font-family="${escapeXml(fontFamily)}"
        font-size="${fontSize}" font-weight="${escapeXml(fontWeight)}"
        fill="${escapeXml(color)}" fill-opacity="${opacity}">${escapeXml(text)}</text>
    </svg>`
  );

  return base
    .composite([{ input: svg }])
    .toBuffer({ resolveWithObject: true });
}

module.exports = { watermarkWithImage, watermarkWithText, addText, resolveAnchor, ANCHORS };
