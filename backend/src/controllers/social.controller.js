'use strict';

const { requireFile, toInt, oneOf } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { loadPresets, getPreset, applyPreset } = require('../services/preset.service');
const queue = require('../utils/concurrency');

/** GET /api/social-resize/presets */
function listPresets(req, res) {
  const presets = loadPresets('socialPresets.json');
  res.json({ presets });
}

/** POST /api/social-resize */
async function socialResize(req, res) {
  requireFile(req, 'image');
  const presetName = oneOf(req.body.platform, Object.keys(loadPresets('socialPresets.json')), 'platform');
  const preset = getPreset(loadPresets('socialPresets.json'), presetName);

  const outputFormat = oneOf(req.body.format, ['jpeg', 'png', 'webp'], 'format', 'jpeg');
  const quality = toInt(req.body.quality, { field: 'quality', min: 1, max: 100, def: 92 });

  const hasCrop = req.body.x !== undefined && req.body.y !== undefined
    && req.body.width !== undefined && req.body.height !== undefined;

  const crop = hasCrop ? {
    x: toInt(req.body.x, { field: 'x', min: 0 }),
    y: toInt(req.body.y, { field: 'y', min: 0 }),
    width: toInt(req.body.width, { field: 'width', min: 1 }),
    height: toInt(req.body.height, { field: 'height', min: 1 }),
  } : null;

  const filePath = req.file.path;
  const { data } = await queue.runWithCleanup(
    () => applyPreset({ input: filePath, preset, crop, outputFormat, quality }),
    [filePath]
  );

  sendBinary(res, data, outputFormat, {
    filename: `${originalStem(req.file.originalname)}-${presetName}`,
    size: data.length,
  });
}

module.exports = { socialResize, listPresets };
