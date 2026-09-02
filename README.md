# 🖼️ Picfix - Modern Free Image & PDF Processing Suite

**Picfix** is a high-performance, privacy-first web application featuring over **67+ free tools** for image editing, official government exam photo resizing, a full PDF utility suite, and local open-source AI microservices.

![Picfix Banner](frontend/public/logo.png)

---

## ✨ Features Overview

### 1. 🤖 AI Tools (100% Free & Open-Source)
* **AI Watermark Remover & Object Eraser** (`/ai-remove-watermark`): Erase unwanted watermarks, date stamps, copyright marks, and background objects seamlessly.
* **AI Image to Text (OCR)** (`/image-to-text`): Extract English and Hindi text from pictures, documents, bills, and screenshots with 1-click Copy & Download TXT.
* **Change Photo Background** (`/change-photo-background`): 1-click official White (Passport/SSC/Govt) and Light Blue (Visa/Intl) background generator.
* **AI Smart Face Crop** (`/ai-face-crop`): Detect facial contours and auto-center portrait photos with optimal 70% head proportion for passports.
* **AI Background Remover** (`/remove-image-background`): High-accuracy subject isolation and transparent cutout via U2Net.
* **AI Photo Enhancer** (`/ai-enhance-image`): Enhance clarity, sharpness, and contrast for low-resolution photos.

### 2. 📄 Complete PDF Suite
* **Unlock PDF (Remove Password)** (`/unlock-pdf`): Permanently remove password protection and encryption from salary slips, bank statements, Aadhaar cards, and tickets.
* **Target Size PDF Compressors**:
  * Compress PDF to 100KB (`/compress-pdf-to-100kb`)
  * Compress PDF to 200KB (`/compress-pdf-to-200kb`)
  * Compress PDF to 300KB (`/compress-pdf-to-300kb`)
  * Compress PDF to 500KB (`/compress-pdf-to-500kb`)
  * Compress PDF to 1MB (`/compress-pdf-to-1mb`)
* **Merge PDF** (`/merge-pdf`): Combine multiple PDF documents into one.
* **Split PDF** (`/split-pdf`): Extract specific pages or custom page ranges.
* **PDF to JPG / PDF to PNG** (`/pdf-to-jpg`, `/pdf-to-png`): Render high-DPI image pages.
* **Crop PDF Margins** (`/crop-pdf`): Trim blank headers, footers, and margins.
* **Grayscale PDF** (`/grayscale-pdf`): Convert colorful PDFs to mono black & white to save printer toner.
* **Organize PDF Pages** (`/organize-pdf`): Sort and rearrange page sequences.
* **PDF Metadata Editor** (`/pdf-metadata`): View and update document Title, Author, Subject, and Keywords.
* **Watermark & Sign PDF** (`/watermark-pdf`, `/sign-pdf`): Stamp text watermarks and digital signature PNGs.

### 3. 🏛️ Official Exam & Identity Card Sizing
* **Passport Photo Maker** (`/passport-size-photo`)
* **SSC CGL/CHSL Photo & Signature Resizer** (`/ssc-photo-resizer`)
* **PAN Card Photo & Signature Resizer** (`/resize-for-pan-card`)
* **Add Name and Date on Photo** (`/add-name-and-date-on-photo`)
* **Merge Photo & Signature Side-by-Side** (`/merge-photo-and-signature`)
* **Target KB Image Compression**: 20KB, 50KB, 100KB, 200KB, 500KB.

---

## 🏗️ Architecture

```
                       ┌─────────────────────────┐
                       │   Next.js 14 Frontend   │ (Port 3000)
                       │   Tailwind + Shadcn/ui  │
                       └────────────┬────────────┘
                                    │ Reverse Proxy / API
                                    ▼
                       ┌─────────────────────────┐
                       │   Express API Gateway   │ (Port 3000)
                       │   Rate Limiter & Multer │
                       └─────┬───────────────┬───┘
                             │               │
                             ▼               ▼
                     ┌──────────────┐  ┌───────────────────┐
                     │ Redis Queue  │  │ Python AI Service │ (Port 8000)
                     │   (BullMQ)   │  │ Rembg, EasyOCR    │
                     └──────┬───────┘  │ MediaPipe, OpenCV │
                            │          └───────────────────┘
                            ▼
                     ┌──────────────┐
                     │ BullMQ Async │
                     │ Image Worker │
                     └──────────────┘
```

---

## 🚀 Free Deployment Guide

### Option A: Free AI Backend on Hugging Face Spaces (Recommended)
Hugging Face offers **Free CPU Basic tier with 2 vCPU and 16 GB RAM** forever!

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Choose:
   * **Space SDK**: `Docker` -> `Blank`
   * **Hardware**: `CPU Basic` (Free)
3. Push the `ai-service` directory to your Hugging Face Space repository:
   ```bash
   cd ai-service
   git init
   git remote add origin https://huggingface.co/spaces/<YOUR_USERNAME>/<SPACE_NAME>
   git add -A
   git commit -m "Deploy Picfix AI microservice"
   git push -u origin main --force
   ```
4. Copy your Hugging Face Space endpoint (e.g., `https://<YOUR_USERNAME>-<SPACE_NAME>.hf.space`) and configure it as `AI_SERVICE_URL` in your backend environment!

### Option B: Free Frontend Deployment on Vercel / Cloudflare Pages
1. Push this repository to **GitHub**.
2. Import the repository into **Vercel** (`https://vercel.com/new`).
3. Set the Root Directory to `frontend`.
4. Set Environment Variables:
   * `NEXT_PUBLIC_API_URL=https://your-backend-api-domain.com`
5. Click **Deploy**. Vercel will build and host the Next.js frontend on a global CDN for free!

### Option C: Self-Hosted Docker Deployment (Current Setup)
To run everything on your own Linux VPS with Docker:
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/image-tools.git
cd image-tools

# Launch all microservices
cd backend
docker compose up -d --build
```

---

## 🛠️ Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Backend API & Worker
```bash
cd backend
npm install
npm run dev
```

### AI Service (Python)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📄 License
MIT License. Free for commercial and personal use.
