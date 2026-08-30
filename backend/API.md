# Image Editor Backend — API Documentation

Pure REST API for image operations. **No frontend included** — this document is the contract for the frontend team.

## Conventions

- **Uploads:** All POST endpoints accept `multipart/form-data` with an image file.
- **Responses (success):** Every processing endpoint returns the **processed image as direct binary response** — consistent across ALL endpoints. Response headers:
  - `Content-Type: image/jpeg|image/png|image/webp|...` or `application/pdf`
  - `Content-Disposition: attachment; filename="..."`
  - `X-Output-Size` — final size in bytes
  - `X-Quality-Used` — quality parameter used (compress endpoint)
  - `X-DPI` — DPI used, where applicable
- **Responses (error):** Always JSON with exact shape:
  ```json
  { "error": "human readable message", "code": "MACHINE_CODE" }
  ```
- **Limits:** Max upload 15MB (configurable via `MAX_FILE_SIZE`). Only image MIME types/extensions allowed: jpeg, png, webp, gif, tiff, avif, heic, heif, svg.
- **Concurrency:** Max 4 simultaneous Sharp operations (configurable). Extra requests wait in a FIFO queue up to 30s, then get `503 QUEUE_TIMEOUT`. Never rejected outright while queue has room.
- **Temp files:** Uploads are deleted immediately after processing. Any leftover files are purged every 5 minutes if older than 30 minutes.

### Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `MISSING_PARAM` | 400 | Required form field absent |
| `MISSING_FILE` | 400 | Required file field absent |
| `INVALID_PARAM` | 400 | Param present but wrong value/type/range |
| `INVALID_FILE_TYPE` | 400 | Upload is not an image |
| `FILE_TOO_LARGE` | 400 | Upload exceeds 15MB |
| `TOO_MANY_FILES` | 400 | More files than allowed (image-to-pdf) |
| `PRESET_NOT_FOUND` | 400 | Unknown preset name |
| `IMAGE_PROCESSING_FAILED` | 422 | Sharp/libvips could not process the file |
| `QUEUE_TIMEOUT` | 503 | Server busy, retry after a moment |
| `AI_NOT_IMPLEMENTED` | 501 | AI stubs only (Python service pending) |
| `NOT_FOUND` | 404 | Unknown route |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Health

```
GET /health
-> 200 { "status": "ok", "uptime": 12.34 }
```

---

## a) POST /api/compress

Compress to a target file size via binary search on quality (max 8 iterations, stops within ±5% of target).

**Request (multipart/form-data):**

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | any supported image |
| `targetSize` | string | yes | e.g. `500KB`, `2MB`, or bare bytes `512000` (min 1KB) |
| `format` | string | no | `jpeg` (default) or `webp` |

**Response:** binary image. Headers include `X-Output-Size` (bytes) and `X-Quality-Used` (20–100).

```bash
curl -F "image=@photo.jpg" -F "targetSize=50KB" \
  -o compressed.jpg -D headers.txt http://localhost:3000/api/compress
# headers.txt: X-Output-Size: 49247 / X-Quality-Used: 75
```

> Note: if even quality 20 cannot reach the target, the smallest achievable result is returned. Check `X-Quality-Used: 20` + size > target as the signal.

## b) POST /api/resize

**Request:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `width` | int | yes | 1–20000 |
| `height` | int | no | omitted → proportional scaling |
| `unit` | string | no | `px` (default), `cm`, `mm`, `inch` |
| `dpi` | int | no | default 300 (used to convert cm/mm/inch → px) |
| `maintainAspectRatio` | string | no | `false` to stretch (default `true`) |
| `fit` | string | no | `cover` (default), `contain`, `inside`, `fill` |
| `format` | string | no | `jpeg`, `png`, `webp`, `tiff`, `avif` |

```bash
curl -F "image=@photo.jpg" -F "width=10" -F "height=15" -F "unit=cm" -F "dpi=300" \
  -o out.jpg http://localhost:3000/api/resize
# 10cm x 15cm @300dpi → 1183 x 1772 px
```

## c) POST /api/crop

Send EITHER `shape` OR coordinates — not both.

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `x`, `y` | int | with coords | top-left of crop rect (default 0) |
| `width`, `height` | int | with coords | crop rect size |
| `shape` | string | no | `square` (centered max square) or `circle` (centered max circle, **PNG with transparency**) |

```bash
curl -F "image=@photo.jpg" -F "x=100" -F "y=50" -F "width=400" -F "height=300" \
  -o out.jpg http://localhost:3000/api/crop
curl -F "image=@photo.png" -F "shape=circle" -o circle.png http://localhost:3000/api/crop
```

## d) POST /api/rotate

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `degrees` | float | yes | 90/180/270 exact; arbitrary angle expands canvas |
| `background` | string | no | hex `#RRGGBB` for custom-angle fill; default transparent (PNG output) |

```bash
curl -F "image=@photo.jpg" -F "degrees=45" -F "background=#ffffff" -o out.jpg http://localhost:3000/api/rotate
curl -F "image=@photo.jpg" -F "degrees=90" -o out.jpg http://localhost:3000/api/rotate
```

## e) POST /api/flip

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `direction` | string | yes | `horizontal` (mirror) or `vertical` |

```bash
curl -F "image=@photo.jpg" -F "direction=horizontal" -o out.jpg http://localhost:3000/api/flip
```

## f) POST /api/watermark

Provide EITHER a `watermark` image file OR a `text` value.

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | base image |
| `watermark` | file | one of | watermark image (scaled relative to base) |
| `text` | string | one of | text watermark |
| `position` | string | no | 9 anchors: `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right` (default `bottom-right`) |
| `opacity` | float | no | 0–1, default 0.7 |
| `scale` | float | no | image watermark width as fraction of base width, default 0.2 |
| `fontSize` | int | no | text watermark, default 48 |
| `color` | string | no | hex, default `#ffffff` |
| `margin` | int | no | px from edges, default 10 |

```bash
# Image watermark
curl -F "image=@photo.jpg" -F "watermark=@logo.png" -F "position=bottom-right" \
  -F "opacity=0.8" -F "scale=0.25" -o out.jpg http://localhost:3000/api/watermark
# Text watermark
curl -F "image=@photo.jpg" -F "text=© MySite" -F "position=bottom-right" \
  -F "opacity=0.8" -F "fontSize=64" -o out.jpg http://localhost:3000/api/watermark
```

## g) POST /api/add-text

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `text` | string | yes | |
| `fontSize` | int | no | default 48 (8–500) |
| `color` | string | no | hex, default `#ffffff` |
| `x`, `y` | int | no | absolute top-left position (overrides `position`) |
| `position` | string | no | 9 anchors, default `top-left` |
| `fontWeight` | string | no | `normal` (default), `bold`, etc. |
| `fontFamily` | string | no | default `sans-serif` |
| `opacity` | float | no | 0–1, default 1 |

```bash
curl -F "image=@photo.jpg" -F "text=Hello World" -F "fontSize=64" \
  -F "color=#ff0000" -F "position=center" -o out.jpg http://localhost:3000/api/add-text
```

## h) POST /api/convert-format

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | HEIC input auto-detected and decoded (heic-convert fallback) |
| `format` | string | yes | `jpg`, `png`, `webp`, `tiff`, `avif` |
| `quality` | int | no | 1–100, default 90 (lossy formats) |

For **heic-to-jpg**, simply send a HEIC file with `format=jpg`.

```bash
curl -F "image=@photo.heic" -F "format=jpg" -o out.jpg http://localhost:3000/api/convert-format
curl -F "image=@photo.jpg" -F "format=webp" -o out.webp http://localhost:3000/api/convert-format
```

## i) POST /api/image-to-pdf

| Field | Type | Required | Notes |
|---|---|---|---|
| `images` | file[] | yes | 1–20 images (repeat field, order preserved) |

**Response:** `application/pdf` binary. Each image = one page sized to the image.

```bash
curl -F "images=@a.jpg" -F "images=@b.jpg" -F "images=@c.png" \
  -o combined.pdf http://localhost:3000/api/image-to-pdf
```

## j) POST /api/grayscale

| Field | Type | Required |
|---|---|---|
| `image` | file | yes |

```bash
curl -F "image=@photo.jpg" -o gray.jpg http://localhost:3000/api/grayscale
```

## k) POST /api/passport-photo

Config-driven: `config/passportPresets.json` — **add new presets by editing the JSON, no code changes or restart needed**. NO face detection; the frontend or AI service supplies the crop region. Without crop coords, center-crops to the preset aspect then resizes.

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `preset` | string | yes | e.g. `2x2-inch`, `35mm-45mm`, `pan-card`, `upsc` |
| `x`, `y`, `width`, `height` | int | no | crop region from frontend/AI face detection |
| `format` | string | no | `jpeg` (default), `png`, `webp` |
| `quality` | int | no | 1–100, default 92 |

**List presets:**
```bash
curl http://localhost:3000/api/passport-photo/presets
# -> { "presets": { "2x2-inch": { "label": ..., "width": 600, "height": 600, "dpi": 300, "notes": ... }, ... } }
```

```bash
curl -F "image=@portrait.jpg" -F "preset=35mm-45mm" \
  -F "x=400" -F "y=100" -F "width=800" -F "height=1030" \
  -o passport.jpg http://localhost:3000/api/passport-photo
```

## l) POST /api/social-resize

Same config-driven system: `config/socialPresets.json`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | yes | |
| `platform` | string | yes | preset name (see list endpoint) |
| `x`, `y`, `width`, `height` | int | no | optional crop region first |
| `format` | string | no | `jpeg` (default), `png`, `webp` |
| `quality` | int | no | default 92 |

Available platforms: `instagram-post`, `instagram-story`, `instagram-portrait`, `instagram-thumbnail`, `whatsapp-dp`, `whatsapp-status`, `youtube-banner`, `youtube-thumbnail`, `facebook-cover`, `facebook-post`, `twitter-post`, `twitter-header`, `linkedin-banner`, `linkedin-post-square`, `pinterest-pin`.

```bash
curl http://localhost:3000/api/social-resize/presets
curl -F "image=@photo.jpg" -F "platform=instagram-story" -o story.jpg http://localhost:3000/api/social-resize
```

---

## AI Feature Stubs (NOT implemented — Python microservice pending)

These routes exist so the frontend can build against a stable contract. They return `501 { "error": ..., "code": "AI_NOT_IMPLEMENTED" }` until the Python FastAPI service at `http://ai-service:8000` replaces them.

### POST /api/ai/remove-background
- Request: `image` (file)
- Expected response 200: **PNG binary** with transparent background, same dimensions
- Will be proxied to: `POST {AI_SERVICE_URL}/remove-background`

### POST /api/ai/ocr
- Request: `image` (file)
- Expected response 200:
  ```json
  { "text": "extracted text", "confidence": 0.94 }
  ```
- Will be proxied to: `POST {AI_SERVICE_URL}/ocr`

### POST /api/ai/detect-face
- Request: `image` (file)
- Expected response 200 (bounding box in px; zeros when no face):
  ```json
  { "x": 210, "y": 88, "width": 320, "height": 320 }
  ```
- Will be proxied to: `POST {AI_SERVICE_URL}/detect-face`

```bash
# What the frontend will eventually call:
curl -F "image=@photo.jpg" -o cutout.png http://localhost:3000/api/ai/remove-background
```
