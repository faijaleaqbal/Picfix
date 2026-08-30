# Multi-stage build for small final image.
# Alpine + Sharp: official sharp docs recommend node:*-alpine with
# `npm install --platform=linuxmusl` handling, but sharp ships musl
# prebuilt binaries by default on alpine since 0.33 — no extra apk deps needed.

FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# ---- Runtime stage ----
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    TEMP_DIR=/tmp/image-uploads \
    MAX_FILE_SIZE=15728640

WORKDIR /app

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only what's needed (node_modules is mostly dev-free already, but
# re-install cleanly in builder to keep this stage simple and small)
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY config ./config

RUN mkdir -p /tmp/image-uploads && chown -R app:app /app /tmp/image-uploads
USER app

# Sharp musl check happens at runtime via require
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 3000

CMD ["node", "src/server.js"]
