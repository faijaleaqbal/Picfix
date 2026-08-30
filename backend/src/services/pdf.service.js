'use strict';

const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

/**
 * Combine one or more images into a single PDF.
 * Each image = one page, sized exactly to the image dimensions.
 * Preserves order. All images converted to PNG first (pdf-lib embeds
 * PNG/JPEG natively; converting everything to PNG keeps it simple and lossless).
 */
async function imagesToPdf({ inputPaths }) {
  const pdf = await PDFDocument.create();

  for (const p of inputPaths) {
    let pngBuf;
    try {
      pngBuf = await sharp(p, { sequentialRead: true }).rotate().png().toBuffer();
    } catch (err) {
      err.status = 422;
      err.code = 'IMAGE_PROCESSING_FAILED';
      err.message = 'One of the images could not be processed. It may be corrupted or unsupported.';
      throw err;
    }
    const meta = await sharp(pngBuf).metadata();
    const img = await pdf.embedPng(pngBuf);

    // Scale px -> pt (1px = 0.75pt at 96dpi) keeps page proportional to image
    const wPt = meta.width * 0.75;
    const hPt = meta.height * 0.75;

    const page = pdf.addPage([wPt, hPt]);
    page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt });
  }

  return pdf.save();
}

module.exports = { imagesToPdf };
