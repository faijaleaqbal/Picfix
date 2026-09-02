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
const { logInfo } = require('./utils/logger');

const app = express();

// Request ID + structured HTTP access log
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
  req.requestId = requestId;
  res.set('X-Request-Id', requestId);

  if (!/^\/health(\/|$)/.test(req.path)) {
    const startNs = process.hrtime.bigint();
    res.on('finish', () => {
      logInfo({
        msg: 'http_request',
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round((Number(process.hrtime.bigint() - startNs) / 1e6) * 10) / 10,
        errorCode: res.locals.errorCode,
        jobId: res.locals.jobId,
        ip: req.ip,
      });
    });
  }
  next();
});

// Middleware to reject new requests during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({ error: 'Server is shutting down', code: 'SHUTTING_DOWN' });
  }
  next();
});

// Trust proxy configuration
// TRUST_PROXY_SUBNET (e.g. "172.20.0.0/16"): only trust X-Forwarded-For from that subnet
// TRUST_PROXY=1 (legacy): trust first hop
// Default (neither): trust proxy OFF - direct access sees real socket IP
if (config.trustProxySubnet) {
  app.set('trust proxy', config.trustProxySubnet);
} else if (config.trustProxy) {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', 0);
}

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

const { closeSharedRedis } = require('./utils/redisClient');
let isShuttingDown = false;

const server = app.listen(config.port, config.host, () => {
  console.log(`[server] image-editor-backend listening on ${config.host}:${config.port} (${config.nodeEnv})`);
  console.log(`[server] sharp concurrency=${sharp.concurrency()} | queue limit=${config.sharpConcurrency} timeout=${config.queueTimeoutMs}ms`);

  // Dev convenience: run the AI worker in-process unless production.
  // Production runs `npm run worker` as a separate process.
  const runInProcess = process.env.RUN_WORKER_INPROCESS === '1' || config.nodeEnv !== 'production';
  if (runInProcess) {
    Promise.resolve(require('./worker').startAiWorker())
      .then((worker) => {
        app.locals.aiWorker = worker;
        console.log('[server] AI worker embedded in-process (dev mode)');
      })
      .catch((err) => console.warn(`[server] AI worker not started: ${err.message}`));
  }
});

async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log(`[server] Already shutting down, ignoring ${signal}`);
    return;
  }

  console.log(`\n[server] Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('[server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();

  try {
    const promises = [];

    // Stop accepting new HTTP connections
    promises.push(new Promise((resolve) => {
      server.close((err) => {
        if (err) console.error('[server] Error closing HTTP server:', err);
        else console.log('[server] HTTP server closed.');
        resolve();
      });
    }));

    // Immediately pause BullMQ worker to stop accepting new jobs and allow active ones to finish
    if (app.locals.aiWorker) {
      console.log('[server] Closing AI worker...');
      promises.push(
        app.locals.aiWorker.close().then(() => {
          console.log('[server] AI worker closed.');
        }).catch(err => {
          console.error('[server] Error closing AI worker:', err);
        })
      );
    }

    await Promise.all(promises);

    // Close Redis connections
    console.log('[server] Closing Redis connections...');
    await closeSharedRedis();
    console.log('[server] Redis connections closed.');

    console.log('[server] Shutdown complete. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('[server] Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

function resetShutdownStateForTests() {
  isShuttingDown = false;
}

module.exports = { server, app, gracefulShutdown, resetShutdownStateForTests };