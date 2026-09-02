---
title: Picfix AI Microservice
emoji: ⚡
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 8000
pinned: false
---

# Picfix AI Microservice (Hugging Face Spaces)

This repository powers the free open-source AI microservice for **Picfix** (Image & Document Tools).

### 🚀 Capabilities:
* **Background Removal**: Powered by `rembg (U2Net)`
* **Multilingual OCR**: Powered by `EasyOCR` (English + Hindi)
* **Face Detection & Smart Crop**: Powered by `MediaPipe Face Mesh`
* **Inpainting & Watermark Removal**: Powered by `OpenCV Telea & Navier-Stokes`

### 📦 Free Deployment to Hugging Face Spaces:
1. Create a new Space on [Hugging Face](https://huggingface.co/new-space).
2. Set Space Name: `picfix-ai-service`
3. Select License: `MIT`
4. Select SDK: **Docker** -> **Blank**
5. Select Hardware: **CPU Basic (Free - 2 vCPU, 16GB RAM)**
6. Clone the space or push the contents of `ai-service/`:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/picfix-ai-service
   git push hf main
   ```
7. Once built, copy your Public Space URL (e.g. `https://your-username-picfix-ai-service.hf.space`) and set it as `AI_SERVICE_URL` in your Picfix `.env`!
