'use strict';

const { requireFile, toFloat, oneOf, invalid } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { rotateImage, flipImage } = require('../services/transform.service');
const queue = require('../utils/concurrency');

async function rotate(req, res) {
  requireFile(req, 'image');
  const degrees = toFloat(req.body.degrees, { field: 'degrees' });

  let background;
  if (req.body.background) {
    const hex = /^#?([0-9a-f]{6})$/i.test(String(req.body.background).trim())
      ? String(req.body.background).replace('#', '')
      : null;
    if (!hex) throw invalid('"background" must be a hex color like "#RRGGBB"');
    background = {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      alpha: 1,
    };
  } else {
    background = { r: 0, g: 0, b: 0, alpha: 0 };
  }

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => rotateImage({ input: filePath, degrees, background }),
    [filePath]
  );

  const isTransparent = background.alpha === 0;
  sendBinary(res, data, isTransparent ? 'png' : info.format, {
    filename: `${originalStem(req.file.originalname)}-rotated`,
    size: data.length,
  });
}

async function flip(req, res) {
  requireFile(req, 'image');
  const direction = oneOf(req.body.direction, ['horizontal', 'vertical'], 'direction');

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => flipImage({ input: filePath, direction }),
    [filePath]
  );

  sendBinary(res, data, info.format, {
    filename: `${originalStem(req.file.originalname)}-flipped`,
    size: data.length,
  });
}

module.exports = { rotate, flip };
