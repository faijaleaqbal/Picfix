'use strict';

const { requireFile } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { grayscaleImage } = require('../services/grayscale.service');
const queue = require('../utils/concurrency');

async function grayscale(req, res) {
  requireFile(req, 'image');

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => grayscaleImage({ input: filePath }),
    [filePath]
  );

  sendBinary(res, data, info.format, {
    filename: `${originalStem(req.file.originalname)}-grayscale`,
    size: data.length,
  });
}

module.exports = { grayscale };
