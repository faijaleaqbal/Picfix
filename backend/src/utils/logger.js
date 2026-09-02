'use strict';

/**
 * Lightweight structured logging (JSON lines on stdout).
 * Deliberately dependency-free: one line per event, machine-parsable,
 * human-readable with `jq`. No log shipping / monitoring stack required.
 *
 * Usage: logInfo({ msg: 'http_request', requestId, status, ... })
 */

function emit(level, fields, stream) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, ...fields });
  stream(line);
}

function logInfo(fields) {
  emit('info', fields, (l) => console.log(l));
}

function logWarn(fields) {
  emit('warn', fields, (l) => console.warn(l));
}

function logError(fields) {
  emit('error', fields, (l) => console.error(l));
}

module.exports = { logInfo, logWarn, logError };