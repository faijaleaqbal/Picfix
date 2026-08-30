'use strict';

const { requireFile, oneOf, toInt } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { convertFormat } = require('../services/convert.service');
const queue = require('../utils/concurrency');

async function convert(req, res) {
  requireFile(req, 'image');
  const target = oneOf(req.body.format || req.body.target, ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'avif'], 'format');
  const quality = toInt(req.body.quality, { field: 'quality', min: 1, max: 100, def: 90 });

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => convertFormat({ input: filePath, target, quality }),
    [filePath]
  );

  sendBinary(res, data, target, {
    filename: `${originalStem(req.file.originalname)}-converted`,
    size: data.length,
  });
}

module.exports = { convert };
