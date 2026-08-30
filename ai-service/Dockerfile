FROM python:3.11-slim

WORKDIR /app
ENV U2NET_HOME=/root/.u2net

# Install system dependencies for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install PyTorch CPU version specifically to save massive amounts of space and RAM
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download models to bake them into the Docker image so it doesn't download on first request
RUN python -c "import easyocr; easyocr.Reader(['en', 'hi'], gpu=False)"
RUN python -c "import os; os.environ['U2NET_HOME'] = '/root/.u2net'; from rembg import new_session; new_session('u2net')"

COPY . .

EXPOSE 8000

# Run with single worker to respect RAM limits
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
