'use strict';

/**
 * Validation helpers. All throw ApiError (caught by error middleware
 * and returned as { error: string, code: string }).
 */

class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const missing = (field) =>
  new ApiError(400, `Missing required parameter: "${field}"`, 'MISSING_PARAM');

const invalid = (msg) => new ApiError(400, msg, 'INVALID_PARAM');

function requireParams(body, ...fields) {
  for (const f of fields) {
    const v = body ? body[f] : undefined;
    if (v === undefined || v === null || v === '') {
      throw missing(f);
    }
  }
}

function requireFile(req, name = 'image') {
  if (!req.file) {
    throw new ApiError(400, `Missing required file field: "${name}"`, 'MISSING_FILE');
  }
}

function requireFiles(req, name = 'images') {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, `Missing required file field: "${name}" (one or more images)`, 'MISSING_FILE');
  }
}

function toInt(v, { field, min, max, def } = {}) {
  if (v === undefined || v === null || v === '') {
    if (def !== undefined) return def;
    throw missing(field || 'value');
  }
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) throw invalid(`"${field}" must be an integer (got "${v}")`);
  if (min !== undefined && n < min) throw invalid(`"${field}" must be >= ${min} (got ${n})`);
  if (max !== undefined && n > max) throw invalid(`"${field}" must be <= ${max} (got ${n})`);
  return n;
}

function toFloat(v, { field, min, max, def } = {}) {
  if (v === undefined || v === null || v === '') {
    if (def !== undefined) return def;
    throw missing(field || 'value');
  }
  const n = parseFloat(v);
  if (!Number.isFinite(n)) throw invalid(`"${field}" must be a number (got "${v}")`);
  if (min !== undefined && n < min) throw invalid(`"${field}" must be >= ${min} (got ${n})`);
  if (max !== undefined && n > max) throw invalid(`"${field}" must be <= ${max} (got ${n})`);
  return n;
}

function toNumberFromStr(v, { field, min, max, def } = {}) {
  if (v === undefined || v === null || v === '') {
    if (def !== undefined) return def;
    throw missing(field || 'value');
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (min !== undefined && v < min) throw invalid(`"${field}" must be >= ${min}`);
    if (max !== undefined && v > max) throw invalid(`"${field}" must be <= ${max}`);
    return v;
  }
  const s = String(v).trim().toLowerCase();
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb)?$/);
  if (!m) throw invalid(`"${field}" must be a number or a size like "500KB" / "2MB" (got "${v}")`);
  let n = parseFloat(m[1]);
  if (m[2] === 'kb') n *= 1024;
  if (m[2] === 'mb') n *= 1024 * 1024;
  if (m[2] === 'b') n *= 1;
  if (min !== undefined && n < min) throw invalid(`"${field}" must be >= ${min}`);
  if (max !== undefined && n > max) throw invalid(`"${field}" must be <= ${max}`);
  return n;
}

function oneOf(v, options, field, def) {
  if (v === undefined || v === null || v === '') {
    if (def !== undefined) return def;
    throw missing(field);
  }
  const s = String(v).toLowerCase();
  if (!options.includes(s)) {
    throw invalid(`"${field}" must be one of: ${options.join(', ')} (got "${v}")`);
  }
  return s;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  ApiError,
  missing,
  invalid,
  requireParams,
  requireFile,
  requireFiles,
  toInt,
  toFloat,
  toNumberFromStr,
  oneOf,
  escapeXml,
};
