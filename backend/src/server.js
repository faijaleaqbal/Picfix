'use strict';

const express = require('express');
const config = require('./config');
const sharp = require('sharp');

// Tune libvips for 2 vCPU
sharp.concurrency(config.libvipsConcurrency);

const healthRoutes = require('./routes/health.routes');
const compressRoutes = require('./routes/compress.routes');
const resizeRoutes = require('./routes/resize.routes');
const cropRoutes = require('./routes/crop.routes');
const transformRoutes = require('./routes/transform.routes');
const annotateRoutes = require('./routes/annotate.routes');
const convertRoutes = require('./routes/convert.routes');
const pdfRoutes = require('./routes/pdf.routes');
const grayscaleRoutes = require('./routes/grayscale.routes');
const passportRoutes = require('./routes/passport.routes');
const socialRoutes = require('./routes/social.routes');
const aiRoutes = require('./routes/ai.routes');

const { errorHandler, notFoundHandler } = require('./middleware/error');
const { startCleanupJob } = require('./utils/cleanup');
const { lightRateLimit } = require('./middleware/rateLimit');

const app = express();

// Behind nginx/ELB: honor X-Forwarded-For so per-IP rate limits see real IPs
if (config.trustProxy) app.set('trust proxy', 1);

// No body size concerns for multipart (multer handles), but keep JSON small
app.use(express.json({ limit: '256kb' }));

// CORS — allowed origins from CORS_ORIGIN / CORS_ORIGIN_PROD env vars
// (dev default: http://localhost:3000). See src/middleware/cors.js.
app.use(require('./middleware/cors').corsMiddleware);

app.use('/', healthRoutes);
// One basic abuse limiter for ALL server-touching /api endpoints (100/hr/IP).
// AI POSTs additionally pass the stricter aiRateLimit inside ai.routes.
app.use('/api', lightRateLimit);
app.use('/api', compressRoutes);
app.use('/api', resizeRoutes);
app.use('/api', cropRoutes);
app.use('/api', transformRoutes);
app.use('/api', annotateRoutes);
app.use('/api', convertRoutes);
app.use('/api', pdfRoutes);
app.use('/api', grayscaleRoutes);
app.use('/api', passportRoutes);
app.use('/api', socialRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

startCleanupJob();

const server = app.listen(config.port, config.host, () => {
  console.log(`[server] image-editor-backend listening on ${config.host}:${config.port} (${config.nodeEnv})`);
  console.log(`[server] sharp concurrency=${sharp.concurrency()} | queue limit=${config.sharpConcurrency} timeout=${config.queueTimeoutMs}ms`);

  // Dev convenience: run the AI worker in-process unless production.
  // Production runs `npm run worker` as a separate process.
  const runInProcess = process.env.RUN_WORKER_INPROCESS === '1' || config.nodeEnv !== 'production';
  if (runInProcess) {
    Promise.resolve(require('./worker').startAiWorker())
      .then(() => console.log('[server] AI worker embedded in-process (dev mode)'))
      .catch((err) => console.warn(`[server] AI worker not started: ${err.message}`));
  }
});

module.exports = { server, app };
