'use strict';

const sharp = require('sharp');
const { requireFile, toNumberFromStr, oneOf, invalid } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { compressToTarget } = require('../services/compress.service');
const queue = require('../utils/concurrency');
const fs = require('fs');

async function compress(req, res) {
  requireFile(req, 'image');
  const targetBytes = toNumberFromStr(req.body.targetSize || req.body.target, { field: 'targetSize', min: 1024 });
  const format = oneOf(req.body.format, ['jpeg', 'webp'], 'format', 'jpeg');

  const filePath = req.file.path;
  const originalSize = fs.statSync(filePath).size;

  const { buffer, size, quality, iterations } = await queue.runWithCleanup(
    () => compressToTarget(filePath, targetBytes, format),
    [filePath]
  );

  sendBinary(res, buffer, format, {
    filename: `${originalStem(req.file.originalname)}-compressed`,
    size: buffer.length,
    quality,
  });

  console.log(`[compress] ${originalSize}B -> ${buffer.length}B (target ${targetBytes}B, q=${quality}, ${iterations} iters)`);
}

module.exports = { compress };
