'use strict';

const { requireFile, toFloat, oneOf, toInt, invalid, escapeXml } = require('../middleware/validate');
const { sendBinary, originalStem } = require('../utils/response');
const { watermarkWithImage, watermarkWithText, addText } = require('../services/annotate.service');
const queue = require('../utils/concurrency');

async function watermark(req, res) {
  // multer .fields() -> files live in req.files keyed by field name
  const baseFile = req.files && req.files.image ? req.files.image[0] : null;
  if (!baseFile) {
    throw new ApiError(400, 'Missing required file field: "image"', 'MISSING_FILE');
  }
  req.file = baseFile; // normalize for requireFile/originalStem below

  const position = oneOf(req.body.position, [
    'top-left', 'top', 'top-right', 'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right',
  ], 'position', 'bottom-right');
  const opacity = toFloat(req.body.opacity, { field: 'opacity', min: 0, max: 1, def: 0.7 });

  const filePath = req.file.path;

  let pathsToClean = [filePath];

  try {
    let result;
    if (req.body.text) {
      const fontSize = toInt(req.body.fontSize, { field: 'fontSize', min: 8, max: 500, def: 48 });
      const color = req.body.color || '#ffffff';
      if (!/^#?[0-9a-f]{6}$/i.test(String(color).trim())) throw invalid('"color" must be a hex color like "#ffffff"');
      result = await queue.runWithCleanup(
        () => watermarkWithText({
          input: filePath,
          text: req.body.text,
          position, opacity, fontSize,
          color: String(color).replace('#', '#'),
          fontFamily: req.body.fontFamily || 'sans-serif',
          margin: toInt(req.body.margin, { field: 'margin', min: 0, max: 2000, def: 10 }),
        }),
        pathsToClean
      );
    } else {
      // Multer with .single('image') + extra field 'watermark' -> need to have accepted 2 files.
      const wmFile = req.files && req.files.watermark ? req.files.watermark[0] : null;
      if (!wmFile) {
        throw invalid('Provide either "text" or a watermark image in the "watermark" file field');
      }
      pathsToClean.push(wmFile.path);
      result = await queue.runWithCleanup(
        () => watermarkWithImage({
          input: filePath,
          watermarkPath: wmFile.path,
          position, opacity,
          scale: toFloat(req.body.scale, { field: 'scale', min: 0.01, max: 1, def: 0.2 }),
          margin: toInt(req.body.margin, { field: 'margin', min: 0, max: 2000, def: 10 }),
        }),
        pathsToClean
      );
    }

    sendBinary(res, result.data, result.info.format, {
      filename: `${originalStem(req.file.originalname)}-watermarked`,
      size: result.data.length,
    });
  } catch (err) {
    // In case runWithCleanup already removed them, swallow unlink errors
    for (const p of pathsToClean) require('fs').unlink(p, () => {});
    throw err;
  }
}

async function addTextHandler(req, res) {
  requireFile(req, 'image');
  if (!req.body.text) throw invalid('Missing required parameter: "text"');
  const fontSize = toInt(req.body.fontSize, { field: 'fontSize', min: 8, max: 500, def: 48 });
  const color = req.body.color || '#ffffff';
  if (!/^#?[0-9a-f]{6}$/i.test(String(color).trim())) throw invalid('"color" must be a hex color like "#ffffff"');

  const hasX = req.body.x !== undefined && req.body.x !== '';
  const hasY = req.body.y !== undefined && req.body.y !== '';
  const position = req.body.position ? oneOf(req.body.position, [
    'top-left', 'top', 'top-right', 'left', 'center', 'right',
    'bottom-left', 'bottom', 'bottom-right',
  ], 'position') : null;

  const filePath = req.file.path;
  const { data, info } = await queue.runWithCleanup(
    () => addText({
      input: filePath,
      text: req.body.text,
      fontSize,
      color: String(color).startsWith('#') ? color : `#${color.replace('#', '')}`,
      x: hasX ? toInt(req.body.x, { field: 'x', min: 0, max: 100000 }) : undefined,
      y: hasY ? toInt(req.body.y, { field: 'y', min: 0, max: 100000 }) : undefined,
      position,
      fontWeight: req.body.fontWeight || 'normal',
      fontFamily: req.body.fontFamily || 'sans-serif',
      opacity: toFloat(req.body.opacity, { field: 'opacity', min: 0, max: 1, def: 1 }),
    }),
    [filePath]
  );

  sendBinary(res, data, info.format, {
    filename: `${originalStem(req.file.originalname)}-text`,
    size: data.length,
  });
}

module.exports = { watermark, addText: addTextHandler };
