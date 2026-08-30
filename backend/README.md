# Image Editor Backend

REST API backend for an all-in-one online image editing tool (image.pi7.org style). Pure API service — **no frontend, no AI** (AI routes are documented stubs for a separate Python FastAPI microservice).

Stack: Node.js + Express + Sharp + Multer + pdf-lib + heic-convert, node-cron cleanup.

## Features

12 image operations + AI stubs: compress (target-size binary search), resize (px/cm/mm/inch @ DPI), crop (rect/square/circle-PNG), rotate, flip, watermark (image/text), add-text, convert-format (incl. HEIC→JPG), image-to-pdf (multi-image), grayscale, passport-photo presets, social-resize presets.

See **[API.md](./API.md)** for the full endpoint contract (the frontend team's reference).

## Local development

```bash
npm install
cp .env.example .env   # edit as needed
npm start              # http://localhost:3000
npm run check          # syntax-check all src files
```

## Docker deployment (preferred for AWS EC2)

Target: 2 vCPU / 8GB RAM EC2 (e.g. `t3.large` / `t3a.large`), Ubuntu 22.04+.

```bash
# 1. Install Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# 2. Get the code + configure
git clone <your-repo-url> image-editor-backend && cd image-editor-backend
cp .env.example .env && nano .env

# 3. Build & run (backend + redis; future ai-service joins the same network)
docker compose up -d --build
docker compose ps
curl http://localhost:3000/health
```

Updates:
```bash
git pull && docker compose up -d --build
```

Logs:
```bash
docker compose logs -f backend
```

## Alternative: PM2 deployment (no Docker)

```bash
# Node 20 LTS via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 20
npm ci --omit=dev
cp .env.example .env && nano .env

# PM2 with cluster mode (2 workers = 1 per vCPU)
sudo npm i -g pm2
NODE_OPTIONS="--max-old-space-size=2048" pm2 start src/server.js -i 2 --name image-editor
pm2 save && pm2 startup    # follow printed instruction to enable boot start
```

> **PM2 cluster-mode note:** with `-i 2` you get 2 processes on a 2-vCPU box. Each process runs its own in-memory concurrency queue, so effective concurrent Sharp ops = 2 × `SHARP_CONCURRENCY`. Set `SHARP_CONCURRENCY=2` in `.env` for PM2 so total stays at 4. Under Docker (single process), keep `SHARP_CONCURRENCY=4`.

## Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/image-editor
server {
    listen 80;
    server_name images.example.com;

    # Match the backend upload limit
    client_max_body_size 15M;

    # Image processing can take a while (compress does multiple encodes)
    proxy_connect_timeout 60s;
    proxy_send_timeout    120s;
    proxy_read_timeout    120s;

    # Don't gzip already-compressed image binaries
    gzip off;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/image-editor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# then HTTPS:
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d images.example.com
```

## Tuning notes (2 vCPU / 8GB)

| Setting | Value | Where |
|---|---|---|
| `--max-old-space-size` | 2048 MB | NODE_OPTIONS (PM2) — leaves room for libvips buffers |
| libvips thread pool | 2 (`sharp.concurrency(2)`) | set automatically from `LIBVIPS_CONCURRENCY=2` |
| Concurrent Sharp ops | 4 (`SHARP_CONCURRENCY=4`) | in-memory FIFO queue; excess waits ≤30s → 503 |
| Docker memory limit | 1536 MB | docker-compose.yml |
| Temp file TTL | 30 min, sweep every 5 min | node-cron |

Memory strategy: Multer streams uploads straight to disk (never buffered in RAM), Sharp reads from disk with `sequentialRead`, one output buffer per request. A 15MB upload never costs more than ~2-3x its size in heap during processing.

## Project structure

```
src/
  config/        env config
  routes/        one router per operation (+ ai stubs, health)
  controllers/   HTTP concerns: parse/validate params, send binary
  services/      pure Sharp/pdf-lib logic, independently testable
  middleware/    multer upload, validation helpers, error handler
  utils/         concurrency queue, cleanup cron, response helpers
config/          passportPresets.json, socialPresets.json (add presets w/o code changes)
```

## Adding presets

Edit `config/passportPresets.json` or `config/socialPresets.json` — the files are re-read on every request, so new presets go live immediately, no restart:

```json
"my-new-preset": { "label": "Display name", "width": 600, "height": 600, "dpi": 300 }
```

## Environment variables

See [.env.example](./.env.example) — PORT, TEMP_DIR, MAX_FILE_SIZE, FILE_TTL_MINUTES, CLEANUP_INTERVAL_MINUTES, SHARP_CONCURRENCY, LIBVIPS_CONCURRENCY, QUEUE_TIMEOUT_MS, MAX_IMAGES_PER_PDF, AI_SERVICE_URL, NODE_ENV.
