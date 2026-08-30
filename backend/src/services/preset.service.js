'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PRESET_DIR = path.join(__dirname, '..', '..', 'config');

/** Load a preset file fresh on each call so new presets apply without restart/code changes */
function loadPresets(name) {
  const file = path.join(PRESET_DIR, name);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getPreset(presets, name) {
  const preset = presets[name];
  if (!preset) {
    const err = new Error(
      `Unknown preset "${name}". Available: ${Object.keys(presets).join(', ')}`
    );
    err.status = 400;
    err.code = 'PRESET_NOT_FOUND';
    throw err;
  }
  return preset;
}

/**
 * Passport/social preset resize:
 * 1. Optional crop region (x,y,w,h) — else center-crop to preset aspect
 * 2. Resize to exact preset dimensions (cover fit)
 * No face detection — coordinates come from the frontend or AI service.
 */
async function applyPreset({ input, preset, crop = null, outputFormat = 'jpeg', quality = 92, background }) {
  let pipeline = sharp(input, { sequentialRead: true }).rotate();

  if (crop && crop.width > 0 && crop.height > 0) {
    pipeline = pipeline.extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height });
  } else {
    // Center-crop to preset aspect ratio first for best face area retention
    const meta = await sharp(input).metadata();
    const targetAR = preset.width / preset.height;
    const srcAR = meta.width / meta.height;
    let cw = meta.width;
    let ch = meta.height;
    if (srcAR > targetAR) {
      cw = Math.round(meta.height * targetAR);
    } else {
      ch = Math.round(meta.width / targetAR);
    }
    if (cw !== meta.width || ch !== meta.height) {
      pipeline = pipeline.extract({
        left: Math.floor((meta.width - cw) / 2),
        top: Math.floor((meta.height - ch) / 2),
        width: cw,
        height: ch,
      });
    }
  }

  const resizeOpts = { fit: 'cover', position: 'centre' };
  if (background) resizeOpts.background = background;
  pipeline = pipeline.resize(preset.width, preset.height, resizeOpts);

  switch (outputFormat) {
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 8 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  return pipeline.toBuffer({ resolveWithObject: true });
}

module.exports = { loadPresets, getPreset, applyPreset };
