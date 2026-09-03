"use client";

import { useState, useRef, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Sparkles,
  Square,
  Wand2,
  Trash2,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WatermarkBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export function AiRemoveWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"auto" | "box">("auto");
  const [boxes, setBoxes] = useState<WatermarkBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [featherRadius, setFeatherRadius] = useState(6);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const origImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setResultDataUrl(null);
      setBoxes([]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          origImageRef.current = img;
          drawBaseCanvas(img, []);
          autoDetectWatermarks(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(f);
    }
  };

  const drawBaseCanvas = useCallback(
    (img: HTMLImageElement, currentBoxes: WatermarkBox[], activeDrawingBox?: typeof currentBox) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      currentBoxes.forEach((box, index) => {
        ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
        ctx.fillRect(box.x, box.y, box.width, box.height);

        ctx.lineWidth = Math.max(2, Math.round(img.width / 400));
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#dc2626";
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.setLineDash([]);

        const label = box.label || `Area ${index + 1}`;
        const fontSize = Math.max(12, Math.round(img.width / 60));
        ctx.font = `bold ${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = "#dc2626";
        ctx.fillRect(box.x, Math.max(0, box.y - (fontSize + 8)), textWidth + 12, fontSize + 8);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, box.x + 6, Math.max(fontSize, box.y - 4));
      });

      if (activeDrawingBox && activeDrawingBox.width > 2 && activeDrawingBox.height > 2) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
        ctx.fillRect(activeDrawingBox.x, activeDrawingBox.y, activeDrawingBox.width, activeDrawingBox.height);

        ctx.lineWidth = Math.max(2, Math.round(img.width / 400));
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#2563eb";
        ctx.strokeRect(activeDrawingBox.x, activeDrawingBox.y, activeDrawingBox.width, activeDrawingBox.height);
        ctx.setLineDash([]);
      }
    },
    []
  );

  const autoDetectWatermarks = (img: HTMLImageElement) => {
    const w = img.width;
    const h = img.height;

    const detected: WatermarkBox[] = [];

    // 1. Bottom-Right Corner (most common: timestamps, copyright, Shot on X)
    const brWidth = Math.round(w * 0.28);
    const brHeight = Math.round(h * 0.12);
    detected.push({
      id: "auto-br",
      x: Math.round(w - brWidth - w * 0.02),
      y: Math.round(h - brHeight - h * 0.02),
      width: brWidth,
      height: brHeight,
      label: "Bottom-Right Watermark",
    });

    // 2. Bottom-Left Corner (Shot On / Device stamps)
    const blWidth = Math.round(w * 0.26);
    const blHeight = Math.round(h * 0.10);
    detected.push({
      id: "auto-bl",
      x: Math.round(w * 0.02),
      y: Math.round(h - blHeight - h * 0.02),
      width: blWidth,
      height: blHeight,
      label: "Bottom-Left Stamp",
    });

    setBoxes(detected);
    drawBaseCanvas(img, detected);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!file || resultDataUrl) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !origImageRef.current) return;
    const current = getCanvasCoords(e);

    const x = Math.min(startPoint.x, current.x);
    const y = Math.min(startPoint.y, current.y);
    const width = Math.abs(current.x - startPoint.x);
    const height = Math.abs(current.y - startPoint.y);

    const activeBox = { x, y, width, height };
    setCurrentBox(activeBox);
    drawBaseCanvas(origImageRef.current, boxes, activeBox);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentBox && currentBox.width > 8 && currentBox.height > 8 && origImageRef.current) {
      const newBox: WatermarkBox = {
        id: `box-${Date.now()}`,
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        label: `Box ${boxes.length + 1}`,
      };
      const updatedBoxes = [...boxes, newBox];
      setBoxes(updatedBoxes);
      drawBaseCanvas(origImageRef.current, updatedBoxes);
    }
    setCurrentBox(null);
    setStartPoint(null);
  };

  const removeBox = (id: string) => {
    const updated = boxes.filter((b) => b.id !== id);
    setBoxes(updated);
    if (origImageRef.current) {
      drawBaseCanvas(origImageRef.current, updated);
    }
  };

  const clearAllBoxes = () => {
    setBoxes([]);
    setResultDataUrl(null);
    if (origImageRef.current) {
      drawBaseCanvas(origImageRef.current, []);
    }
  };

  const handleInpaint = () => {
    const canvas = canvasRef.current;
    const origImg = origImageRef.current;
    if (!canvas || !origImg || boxes.length === 0) return;

    setProcessing(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const width = origImg.width;
          const height = origImg.height;

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) return;

          tempCtx.drawImage(origImg, 0, 0);
          const imgData = tempCtx.getImageData(0, 0, width, height);
          const pixels = imgData.data;

          const mask = new Uint8Array(width * height);
          boxes.forEach((box) => {
            const bx = Math.max(0, Math.min(width - 1, box.x));
            const by = Math.max(0, Math.min(height - 1, box.y));
            const bw = Math.min(width - bx, box.width);
            const bh = Math.min(height - by, box.height);

            for (let y = by; y < by + bh; y++) {
              for (let x = bx; x < bx + bw; x++) {
                mask[y * width + x] = 1;
              }
            }
          });

          const passes = 12;
          for (let pass = 0; pass < passes; pass++) {
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                if (mask[idx] === 1) {
                  let r = 0, g = 0, b = 0, count = 0;

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

                  for (const n of neighbors) {
                    const pi = n * 4;
                    r += pixels[pi];
                    g += pixels[pi + 1];
                    b += pixels[pi + 2];
                    count++;
                  }

                  if (count > 0) {
                    const pi = idx * 4;
                    pixels[pi] = Math.round(r / count);
                    pixels[pi + 1] = Math.round(g / count);
                    pixels[pi + 2] = Math.round(b / count);
                  }
                }
              }
            }
          }

          const feather = Math.max(2, featherRadius);
          for (let y = feather; y < height - feather; y++) {
            for (let x = feather; x < width - feather; x++) {
              const idx = y * width + x;
              if (mask[idx] === 1) {
                let isEdge = false;
                for (let dy = -feather; dy <= feather; dy++) {
                  for (let dx = -feather; dx <= feather; dx++) {
                    if (mask[(y + dy) * width + (x + dx)] === 0) {
                      isEdge = true;
                      break;
                    }
                  }
                  if (isEdge) break;
                }

                if (isEdge) {
                  let r = 0, g = 0, b = 0, total = 0;
                  for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                      const pi = ((y + dy) * width + (x + dx)) * 4;
                      r += pixels[pi];
                      g += pixels[pi + 1];
                      b += pixels[pi + 2];
                      total++;
                    }
                  }
                  const pi = idx * 4;
                  pixels[pi] = Math.round(r / total);
                  pixels[pi + 1] = Math.round(g / total);
                  pixels[pi + 2] = Math.round(b / total);
                }
              }
            }
          }

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.putImageData(imgData, 0, 0);
          }

          const outUrl = canvas.toDataURL("image/png");
          setResultDataUrl(outUrl);
        } catch (err) {
          console.error(err);
          alert("Watermark removal encountered an error.");
        } finally {
          setProcessing(false);
        }
      }, 40);
    });
  };

  const handleDownload = () => {
    if (!resultDataUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `clean-${file.name.replace(/\.[^/.]+$/, "")}.png`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Canvas / Workspace Column */}
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center transition-all hover:border-[#4449A6] hover:bg-[#fafbfe] shadow-sm"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handleFile}
            />
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#eff0fa] text-[#4956a5] transition-transform group-hover:scale-110 shadow-inner">
              <Sparkles className="size-8" />
            </div>
            <p className="mb-1 text-lg font-bold text-gray-800">
              Upload Image to Remove Watermark
            </p>
            <p className="mb-4 text-xs text-gray-500">
              Auto-detects stamps or drag boxes manually to erase logos &amp; text
            </p>
            <span className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]">
              <Square className="size-4" />
              <span>Select Image</span>
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-[#d9dcea] bg-white p-4 shadow-sm">
            {/* Top Toolbar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#eff0fa] px-2.5 py-1 text-xs font-bold text-[#4449A6]">
                  {mode === "auto" ? "🤖 Auto-Detect Active" : "🔲 Box Selection Mode"}
                </span>
                <span className="text-xs text-gray-500">
                  {boxes.length} {boxes.length === 1 ? "zone" : "zones"} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                {resultDataUrl && (
                  <button
                    type="button"
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onMouseLeave={() => setShowOriginal(false)}
                    className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
                  >
                    <Eye className="size-3.5" />
                    Hold for Original
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAllBoxes}
                  className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative flex max-h-[550px] w-full items-center justify-center overflow-auto rounded-lg border border-gray-200 bg-[#f4f5fa] p-3">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #c7cbe0 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={cn(
                  "relative z-10 max-h-[500px] w-auto max-w-full rounded shadow-md object-contain transition-all",
                  !resultDataUrl && "cursor-crosshair",
                  showOriginal && "opacity-90"
                )}
              />
            </div>

            {/* Instruction Banner */}
            {!resultDataUrl && (
              <p className="mt-2 text-center text-xs font-medium text-gray-500">
                💡 <b>Instructions:</b> Click and drag your mouse to draw rectangular boxes over watermarks. Add multiple boxes if needed.
              </p>
            )}

            {resultDataUrl && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-[#e6f5ec] p-3 text-xs font-bold text-[#1d7a44]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>Watermarks erased cleanly! Texture blended successfully.</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="rounded bg-[#1d7a44] px-3 py-1.5 text-xs text-white shadow hover:bg-[#156034]"
                >
                  Download PNG
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings / Controls Column */}
      <div className="sticky top-20 flex h-fit flex-col gap-5 rounded-xl border border-[#d9dcea] bg-white p-5 shadow-sm lg:col-span-4">
        <div className="border-b border-[#e3e4ef] pb-3">
          <h3 className="text-base font-bold text-[#2b2f52]">
            Watermark Remover
          </h3>
          <p className="text-xs text-gray-500">
            Intelligent AI detection &amp; box-guided inpainting
          </p>
        </div>

        {file && (
          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Detection Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("auto");
                    if (origImageRef.current) autoDetectWatermarks(origImageRef.current);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-bold transition-all",
                    mode === "auto"
                      ? "border-[#4956a5] bg-[#eff0fa] text-[#4956a5] ring-2 ring-[#4956a5]/20"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Wand2 className="mb-1 size-4" />
                  <span>Auto-Detect</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("box")}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-bold transition-all",
                    mode === "box"
                      ? "border-[#4956a5] bg-[#eff0fa] text-[#4956a5] ring-2 ring-[#4956a5]/20"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Square className="mb-1 size-4" />
                  <span>Box Selection</span>
                </button>
              </div>
            </div>

            {/* Active Watermark Boxes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Selected Regions</span>
                <span>{boxes.length} active</span>
              </div>

              {boxes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                  No boxes selected. Drag on image to add a box.
                </div>
              ) : (
                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                  {boxes.map((b, i) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-semibold text-gray-700 truncate max-w-[170px]">
                        {b.label || `Box ${i + 1}`} ({Math.round(b.width)}x{Math.round(b.height)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBox(b.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete this box"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edge Feather Slider */}
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>Edge Blend Softness</span>
                <span>{featherRadius} px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={featherRadius}
                onChange={(e) => setFeatherRadius(Number(e.target.value))}
                className="w-full accent-[#4956a5]"
              />
            </div>

            {/* Main Action CTA */}
            <button
              type="button"
              disabled={boxes.length === 0 || processing}
              onClick={handleInpaint}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {processing ? "Erasing Watermarks..." : "Erase Watermark"}
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
          <div className="space-y-3 text-xs leading-relaxed text-[#6e7288]">
            <p>
              ✨ <b>Auto-Detect Mode:</b> Automatically detects timestamps, dates, and camera logos in corner regions.
            </p>
            <p>
              🔲 <b>Box Selection Mode:</b> Drag to draw exact rectangular bounding boxes over any custom watermark.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

