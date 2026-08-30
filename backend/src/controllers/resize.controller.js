'use strict';

const { requireFile, toInt, toFloat, oneOf, invalid } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { resizeImage } = require('../services/resize.service');
const queue = require('../utils/concurrency');

async function resize(req, res) {
  requireFile(req, 'image');
  const width = toInt(req.body.width, { field: 'width', min: 1, max: 20000 });
  const hasHeight = req.body.height !== undefined && req.body.height !== null && req.body.height !== '';
  const height = hasHeight ? toInt(req.body.height, { field: 'height', min: 1, max: 20000 }) : null;
  const unit = oneOf(req.body.unit, ['px', 'cm', 'mm', 'inch', 'in'], 'unit', 'px');
  const dpi = toInt(req.body.dpi, { field: 'dpi', min: 72, max: 1200, def: 300 });
  const maintainAspectRatio = req.body.maintainAspectRatio !== 'false' && req.body.maintainAspectRatio !== false;
  const fit = oneOf(req.body.fit, ['cover', 'contain', 'inside', 'fill'], 'fit', 'cover');
  const format = req.body.format ? oneOf(req.body.format, ['jpeg', 'png', 'webp', 'tiff', 'avif'], 'format') : null;

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => resizeImage({
      input: filePath,
      width, height, unit, dpi,
      maintainAspectRatio, fit,
      format: format === 'jpeg' ? 'jpeg' : format,
    }),
    [filePath]
  );

  sendBinary(res, data, info.format, {
    filename: `${originalStem(req.file.originalname)}-resized`,
    size: data.length,
    dpi,
  });
}

module.exports = { resize };
