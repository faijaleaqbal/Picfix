# AI Microservice API Contract

This document defines the REST API contract for the Python AI microservices. These endpoints are hosted on the `ai-service` container at port `8000`.

**Base URL**: `http://ai-service:8000`

---

## 1. Background Removal

Removes the background from an uploaded image using the U2Net model.

**Endpoint**: `POST /remove-background`
**Content-Type**: `multipart/form-data`

### Request
- `image`: The image file to process (binary file). Supported formats: JPEG, PNG, WebP.

### Response
- **Status 200 OK**:
  - **Content-Type**: `image/png`
  - **Body**: Binary PNG image data with a transparent background.
- **Status 400 Bad Request**:
  - `{"detail": "Invalid or unsupported image format."}`
- **Status 503 Service Unavailable**:
  - `{"detail": "Server busy, please try again in a few seconds."}`

---

## 2. OCR (Image to Text)

Extracts English and Hindi text from an image using EasyOCR.

**Endpoint**: `POST /ocr`
**Content-Type**: `multipart/form-data`

### Request
- `image`: The image file to process (binary file).

### Response
- **Status 200 OK**:
  - **Content-Type**: `application/json`
  - **Body**:
    ```json
    {
      "results": [
        {
          "text": "Extracted text string",
          "confidence": 0.9543
        },
        ...
      ]
    }
    ```
- **Status 400 Bad Request**:
  - `{"detail": "Invalid image format."}`
- **Status 503 Service Unavailable**:
  - `{"detail": "Server busy, please try again in a few seconds."}`

---

## 3. Face Detection

Detects the primary face in an image and provides a bounding box and suggested crop coordinates for standard passport photo ratios (3:4 aspect ratio).

**Endpoint**: `POST /detect-face`
**Content-Type**: `multipart/form-data`

### Request
- `image`: The image file to process (binary file).

### Response
- **Status 200 OK**:
  - **Content-Type**: `application/json`
  - **Body (When Face Found)**:
    ```json
    {
      "x": 120,
      "y": 80,
      "width": 200,
      "height": 200,
      "suggested_crop": {
        "x": 20,
        "y": 40,
        "width": 400,
        "height": 533,
        "aspect_ratio": "3:4"
      }
    }
    ```
  - **Body (No Face Found)**:
    ```json
    {
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "suggested_crop": null
    }
    ```
- **Status 400 Bad Request**:
  - `{"detail": "Invalid image format."}`
- **Status 503 Service Unavailable**:
  - `{"detail": "Server busy, please try again in a few seconds."}`
