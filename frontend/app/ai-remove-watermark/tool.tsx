"use client";

import { useState, useRef } from "react";
import { Download, RotateCcw, Paintbrush, Sparkles } from "lucide-react";

export function AiRemoveWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [brushSize, setBrushSize] = useState(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const origImageRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setResultDataUrl(null);
      setHasMask(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          origImageRef.current = img;
          initCanvases(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(f);
    }
  };

  const initCanvases = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    canvas.width = img.width;
    canvas.height = img.height;
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }

    const maskCtx = maskCanvas.getContext("2d");
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!file || resultDataUrl) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const { x, y } = getCanvasCoords(e);

    // Draw on mask canvas (white mark)
    const maskCtx = maskCanvas.getContext("2d");
    if (maskCtx) {
      maskCtx.fillStyle = "white";
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
    }

    // Draw visible red overlay on main canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.45)"; // Semi-transparent red highlight
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    setHasMask(true);
  };

  const resetSelection = () => {
    if (origImageRef.current) {
      initCanvases(origImageRef.current);
      setHasMask(false);
      setResultDataUrl(null);
    }
  };

  /**
   * Fast localized inpainting algorithm:
   * Finds boundary pixels of the mask and diffuses adjacent clean textures inwards
   */
  const handleInpaint = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const origImg = origImageRef.current;
    if (!canvas || !maskCanvas || !origImg) return;

    setProcessing(true);

    // Run in requestAnimationFrame to allow UI to render spinner
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const width = canvas.width;
          const height = canvas.height;

          // Fresh original image data
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) return;

          tempCtx.drawImage(origImg, 0, 0);
          const imgData = tempCtx.getImageData(0, 0, width, height);
          const pixels = imgData.data;

          // Get mask data
          const maskCtx = maskCanvas.getContext("2d");
          if (!maskCtx) return;
          const maskData = maskCtx.getImageData(0, 0, width, height).data;

          // Inpaint iterations (Multi-pass fast diffusion)
          const isMasked = new Uint8Array(width * height);
          for (let i = 0; i < width * height; i++) {
            if (maskData[i * 4 + 3] > 20) {
              isMasked[i] = 1;
            }
          }

          const passes = 6;
          for (let pass = 0; pass < passes; pass++) {
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                if (isMasked[idx] === 1) {
                  let rSum = 0, gSum = 0, bSum = 0, count = 0;

                  // 8-neighborhood sampling
                  const neighbors = [
                    (y - 1) * width + (x - 1),
                    (y - 1) * width + x,
                    (y - 1) * width + (x + 1),
                    y * width + (x - 1),
                    y * width + (x + 1),
                    (y + 1) * width + (x - 1),
                    (y + 1) * width + x,
                    (y + 1) * width + (x + 1),
                  ];

                  for (const nIdx of neighbors) {
                    const pIdx = nIdx * 4;
                    rSum += pixels[pIdx];
                    gSum += pixels[pIdx + 1];
                    bSum += pixels[pIdx + 2];
                    count++;
                  }

                  if (count > 0) {
                    const p = idx * 4;
                    pixels[p] = Math.round(rSum / count);
                    pixels[p + 1] = Math.round(gSum / count);
                    pixels[p + 2] = Math.round(bSum / count);
                  }
                }
              }
            }
          }

          // Put back on display canvas
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.putImageData(imgData, 0, 0);
          }

          const outUrl = canvas.toDataURL("image/png");
          setResultDataUrl(outUrl);
        } catch (err) {
          console.error(err);
          alert("Error removing watermark.");
        } finally {
          setProcessing(false);
        }
      }, 50);
    });
  };

  const handleDownload = () => {
    if (!resultDataUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `clean-${file.name}`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center hover:border-[#4449A6]">
            <input
              type="file"
              accept="image/*"
              id="watermark-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Upload an image to remove watermarks, logos, or unwanted objects
            </p>
            <label
              htmlFor="watermark-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <Paintbrush className="size-4" />
              <span>Select Image</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                🖌️ Paint over the watermark or object you want to erase:
              </span>
              <button
                type="button"
                onClick={resetSelection}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
              >
                <RotateCcw className="size-3" />
                Reset Brush
              </button>
            </div>

            <div className="relative flex max-h-[550px] w-full items-center justify-center overflow-auto rounded border border-gray-200 bg-[#f8f9fc] p-2">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="max-h-[500px] w-auto cursor-crosshair rounded object-contain shadow-sm"
              />
              <canvas ref={maskCanvasRef} className="hidden" />
            </div>

            {resultDataUrl && (
              <div className="mt-4 rounded bg-[#e6f5ec] p-3 text-center text-xs font-bold text-[#1d7a44]">
                ✓ Watermark erased successfully! You can download your clean image below.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          AI Watermark Eraser
        </h3>

        {file && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Brush Size</span>
                <span>{brushSize} px</span>
              </div>
              <input
                type="range"
                min="8"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                className="mt-1.5 w-full accent-[#4449A6]"
              />
            </div>

            <div className="rounded bg-[#eff0fa] p-3 text-[11px] leading-relaxed text-[#4449A6]">
              💡 <b>How it works:</b> Use your mouse or finger to highlight over the watermark text or logo. Then click <b>Erase Watermark</b>.
            </div>

            <button
              type="button"
              disabled={!hasMask || processing}
              onClick={handleInpaint}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {processing ? "Erasing Watermark..." : "Erase Watermark"}
            </button>

            {resultDataUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded bg-[#047e73] py-2.5 font-bold text-white shadow hover:bg-[#036960]"
              >
                <Download className="size-4" />
                Download Clean Image
              </button>
            )}
          </div>
        )}

        {!file && (
          <p className="text-xs leading-relaxed text-[#6e7288]">
            Remove date stamps, copyright text, logos, photo tags, and unwanted objects seamlessly with smart local inpainting.
          </p>
        )}
      </div>
    </div>
  );
}
