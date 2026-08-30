'use strict';

const config = require('../config');
const { ApiError } = require('../middleware/validate');

/**
 * In-memory semaphore limiting concurrent Sharp operations.
 * Requests beyond the cap WAIT in FIFO order up to QUEUE_TIMEOUT_MS,
 * then get 503 { error, code: "QUEUE_TIMEOUT" } — never rejected outright.
 */
class ConcurrencyQueue {
  constructor(limit, timeoutMs) {
    this.limit = limit;
    this.timeoutMs = timeoutMs;
    this.active = 0;
    this.waiting = [];
  }

  acquire() {
    return new Promise((resolve, reject) => {
      if (this.active < this.limit) {
        this.active++;
        return resolve();
      }
      const item = { resolve, reject, timer: null };
      item.timer = setTimeout(() => {
        const idx = this.waiting.indexOf(item);
        if (idx !== -1) this.waiting.splice(idx, 1);
        reject(new ApiError(503, 'Server busy — too many image operations queued. Please retry shortly.', 'QUEUE_TIMEOUT'));
      }, this.timeoutMs);
      this.waiting.push(item);
    });
  }

  release() {
    const next = this.waiting.shift();
    if (next) {
      clearTimeout(next.timer);
      next.resolve(); // slot transfers directly, active count unchanged
    } else {
      this.active = Math.max(0, this.active - 1);
    }
  }

  /** Wraps an async fn with acquire/release + input cleanup */
  runWithCleanup(fn, pathsToClean) {
    return this.acquire()
      .then(() => fn())
      .finally(() => {
        this.release();
        cleanupFiles(pathsToClean);
      });
  }
}

function cleanupFiles(paths) {
  for (const p of paths || []) {
    if (!p) continue;
    fs.unlink(p, () => {});
  }
}

const fs = require('fs');
const queue = new ConcurrencyQueue(config.sharpConcurrency, config.queueTimeoutMs);

module.exports = queue;
