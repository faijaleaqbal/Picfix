'use strict';

const { requireFile, toInt, oneOf, invalid } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { cropImage } = require('../services/crop.service');
const queue = require('../utils/concurrency');

async function crop(req, res) {
  requireFile(req, 'image');
  const shape = req.body.shape ? oneOf(req.body.shape, ['square', 'circle'], 'shape') : null;

  let x = 0, y = 0, width = null, height = null;
  if (!shape) {
    x = toInt(req.body.x, { field: 'x', min: 0, def: 0 });
    y = toInt(req.body.y, { field: 'y', min: 0, def: 0 });
    width = toInt(req.body.width, { field: 'width', min: 1, max: 20000 });
    height = toInt(req.body.height, { field: 'height', min: 1, max: 20000 });
  } else if (req.body.width || req.body.height) {
    // shape with explicit size not supported — shape implies auto square/circle
    throw invalid('"shape" preset ignores x/y/width/height — send either shape OR coordinates, not both');
  }

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => cropImage({ input: filePath, x, y, width, height, shape }),
    [filePath]
  );

  sendBinary(res, data, shape === 'circle' ? 'png' : info.format, {
    filename: `${originalStem(req.file.originalname)}-cropped`,
    size: data.length,
  });
}

module.exports = { crop };
