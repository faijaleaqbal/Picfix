'use strict';

const config = require('../config');
const { requireFiles, invalid } = require('../middleware/validate');
const { sendBinary } = require('../utils/response');
const { imagesToPdf } = require('../services/pdf.service');
const queue = require('../utils/concurrency');

async function imageToPdf(req, res) {
  requireFiles(req, 'images');

  if (req.files.length > config.maxImagesPerPdf) {
    throw invalid(`Too many images: ${req.files.length}. Max is ${config.maxImagesPerPdf}`);
  }

  const paths = req.files.map((f) => f.path);

  const pdfBytes = await queue.runWithCleanup(
    () => imagesToPdf({ inputPaths: paths }),
    paths
  );

  sendBinary(res, Buffer.from(pdfBytes), 'pdf', {
    filename: 'combined',
    size: pdfBytes.length,
  });
}

module.exports = { imageToPdf };
