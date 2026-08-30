import io
import hashlib
import asyncio
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.responses import Response, JSONResponse
from PIL import Image, UnidentifiedImageError
import numpy as np

# ML Libraries
from rembg import remove, new_session
import easyocr
import mediapipe as mp
import cv2

app = FastAPI(title="AI Image Tools Microservice")

# --- Global State & Models ---
# Initialize models globally so they stay in memory (CPU bound)
# 1. Rembg (U2Net)
rembg_session = new_session("u2net")

# 2. EasyOCR (English + Hindi, CPU)
# Initialize EasyOCR reader for English and Hindi. gpu=False ensures CPU only.
try:
    ocr_reader = easyocr.Reader(['en', 'hi'], gpu=False)
except Exception as e:
    print(f"Failed to load EasyOCR: {e}")
    ocr_reader = None

import mediapipe as mp

# MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection

face_detector = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)

# --- Concurrency & Queue Management ---
# Limit concurrent processing to 1 to stay within RAM and CPU limits (2 vCPU).
MAX_CONCURRENT = 1
MAX_QUEUE = 5
semaphore = asyncio.Semaphore(MAX_CONCURRENT)
current_requests = 0

# --- Simple In-Memory Cache for Background Removal ---
# Stores SHA256 hash -> PNG bytes. Max 20 items to save RAM.
bg_removal_cache = {}
CACHE_MAX_SIZE = 20

def add_to_cache(img_hash: str, result_bytes: bytes):
    if len(bg_removal_cache) >= CACHE_MAX_SIZE:
        # Remove oldest (random in normal dict, but Python dicts maintain insertion order)
        oldest_key = next(iter(bg_removal_cache))
        del bg_removal_cache[oldest_key]
    bg_removal_cache[img_hash] = result_bytes

async def acquire_lock_or_503():
    global current_requests
    if current_requests >= MAX_QUEUE + MAX_CONCURRENT:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server busy, please try again in a few seconds."
        )
    current_requests += 1
    await semaphore.acquire()

def release_lock():
    global current_requests
    current_requests -= 1
    semaphore.release()


def validate_image(file_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Verify it's an image
        
        # Reset file pointer and reload for actual processing
        return Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except (UnidentifiedImageError, IOError) as e:
        raise HTTPException(status_code=400, detail="Invalid or unsupported image format.")

@app.post("/remove-background")
async def remove_background(image: UploadFile = File(...)):
    """
    Removes the background from an image.
    Returns a PNG with a transparent background.
    """
    file_bytes = await image.read()
    
    # Hash for caching
    img_hash = hashlib.sha256(file_bytes).hexdigest()
    if img_hash in bg_removal_cache:
        return Response(content=bg_removal_cache[img_hash], media_type="image/png")

    # Queue management
    await acquire_lock_or_503()
    try:
        # Offload CPU-heavy blocking task to threadpool
        loop = asyncio.get_event_loop()
        result_bytes = await loop.run_in_executor(None, process_remove_background, file_bytes)
        
        add_to_cache(img_hash, result_bytes)
        return Response(content=result_bytes, media_type="image/png")
    finally:
        release_lock()

def process_remove_background(file_bytes: bytes) -> bytes:
    try:
        input_image = Image.open(io.BytesIO(file_bytes))
        output_image = remove(input_image, session=rembg_session)
        
        out_io = io.BytesIO()
        output_image.save(out_io, format="PNG")
        return out_io.getvalue()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing background: {str(e)}")

@app.post("/ocr")
async def extract_text(image: UploadFile = File(...)):
    """
    Extracts English and Hindi text from an image.
    """
    if ocr_reader is None:
        raise HTTPException(status_code=500, detail="OCR model not loaded.")
        
    file_bytes = await image.read()
    
    await acquire_lock_or_503()
    try:
        loop = asyncio.get_event_loop()
        text_results = await loop.run_in_executor(None, process_ocr, file_bytes)
        return JSONResponse(content=text_results)
    finally:
        release_lock()

def process_ocr(file_bytes: bytes) -> list:
    try:
        # Convert bytes to numpy array for EasyOCR
        img_array = np.frombuffer(file_bytes, np.uint8)
        img_cv = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img_cv is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")
            
        # Run EasyOCR
        results = ocr_reader.readtext(img_cv)
        
        if not results:
            return {"text": "", "confidence": 0.0}
            
        # Format results: combine text and average confidence
        combined_text = " ".join([text for _, text, _ in results])
        avg_confidence = sum([conf for _, _, conf in results]) / len(results)
        
        return {
            "text": combined_text,
            "confidence": float(avg_confidence)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during OCR: {str(e)}")

@app.post("/detect-face")
async def detect_face(image: UploadFile = File(...)):
    """
    Detects the primary face in an image and returns bounding box and suggested crop coordinates.
    """
    file_bytes = await image.read()
    
    await acquire_lock_or_503()
    try:
        loop = asyncio.get_event_loop()
        face_data = await loop.run_in_executor(None, process_face_detection, file_bytes)
        
        if not face_data:
            return JSONResponse(content={
                "x": 0, "y": 0, "width": 0, "height": 0,
                "suggested_crop": None
            })
            
        return JSONResponse(content=face_data)
    finally:
        release_lock()

def process_face_detection(file_bytes: bytes) -> Optional[dict]:
    try:
        img_array = np.frombuffer(file_bytes, np.uint8)
        img_cv = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img_cv is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")
            
        # MediaPipe expects RGB
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        h, w, _ = img_rgb.shape
        
        results = face_detector.process(img_rgb)
        
        if not results.detections:
            return None
            
        # Get the highest confidence face (usually the most prominent)
        detection = max(results.detections, key=lambda d: d.score[0])
        bbox = detection.location_data.relative_bounding_box
        
        # Convert relative to absolute coordinates
        x = max(0, int(bbox.xmin * w))
        y = max(0, int(bbox.ymin * h))
        width = min(w - x, int(bbox.width * w))
        height = min(h - y, int(bbox.height * h))
        
        # Calculate suggested passport crop (aspect ratio 3:4 or 4:5 typically, let's use 3:4)
        # Standard passport photo: head takes up ~70% of the image height.
        # Let's provide a 3:4 aspect ratio bounding box centered around the face.
        crop_width = int(width * 2)
        crop_height = int(crop_width * 1.33)  # 3:4 ratio
        
        center_x = x + width // 2
        center_y = y + height // 2
        
        crop_x = max(0, center_x - crop_width // 2)
        crop_y = max(0, center_y - int(crop_height * 0.4)) # offset slightly upwards
        
        # Constrain to image boundaries
        crop_x2 = min(w, crop_x + crop_width)
        crop_y2 = min(h, crop_y + crop_height)
        crop_x = max(0, crop_x2 - crop_width)
        crop_y = max(0, crop_y2 - crop_height)
        
        actual_crop_width = crop_x2 - crop_x
        actual_crop_height = crop_y2 - crop_y
        
        return {
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "suggested_crop": {
                "x": crop_x,
                "y": crop_y,
                "width": actual_crop_width,
                "height": actual_crop_height,
                "aspect_ratio": "3:4"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during face detection: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok", "active_requests": current_requests}
