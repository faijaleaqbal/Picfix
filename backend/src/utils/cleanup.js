'use strict';

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('../config');

/**
 * Cron job: deletes files older than FILE_TTL_MINUTES from TEMP_DIR
 * and TEMP_DIR/ai-results (AI binary results — capped at 30 min).
 * Runs every CLEANUP_INTERVAL_MINUTES. Logs counts only (no filenames).
 */
function cleanupOnce() {
  const dirs = [config.tempDir, path.join(config.tempDir, 'ai-results')];
  const cutoff = Date.now() - config.fileTtlMinutes * 60 * 1000;
  let deleted = 0;
  let errors = 0;

  for (const dir of dirs) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue; // dir may not exist yet
    }

    for (const name of entries) {
      const full = path.join(dir, name);
      try {
        const st = fs.statSync(full);
        if (st.isFile() && st.mtimeMs < cutoff) {
          fs.unlinkSync(full);
          deleted++;
        }
      } catch {
        errors++;
      }
    }
  }
  if (deleted > 0 || errors > 0) {
    console.log(`[cleanup] removed ${deleted} expired file(s), ${errors} error(s)`);
  }
}

function startCleanupJob() {
  fs.mkdirSync(config.tempDir, { recursive: true });
  const minutes = Math.max(1, config.cleanupIntervalMinutes);
  const expr = minutes >= 60 ? '0 * * * *' : `*/${minutes} * * * *`;
  if (!cron.validate(expr)) {
    console.error('[cleanup] invalid cron expression', expr);
    return;
  }
  cron.schedule(expr, cleanupOnce);
  // also sweep once at boot
  cleanupOnce();
  console.log(`[cleanup] scheduled "${expr}" (ttl=${config.fileTtlMinutes}m, dir=${config.tempDir})`);
}

module.exports = { startCleanupJob, cleanupOnce };
