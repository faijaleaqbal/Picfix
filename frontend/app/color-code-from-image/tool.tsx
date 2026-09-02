"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { Copy, Check, Pipette } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";

export function ColorPickerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string; hsl: string } | null>({
    hex: "#4449A6",
    rgb: "rgb(68, 73, 166)",
    hsl: "hsl(237, 42%, 46%)",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setSrc(URL.createObjectURL(f));
  };

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
  }, [src]);

  const getColorAt = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    const rgb = `rgb(${r}, ${g}, ${b})`;

    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }
    const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    setPickedColor({ hex, rgb, hsl });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Image Here"
            description="Upload an image to pick and inspect colors"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={handleFile}
          />
        ) : (
          <div className="flex flex-col items-center rounded-md border border-[#d9dcea] bg-[#fafbfe] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Pipette className="size-4 text-[#4449A6]" />
              Hover or click anywhere on the image below to pick color
            </div>
            <div className="max-h-[500px] cursor-crosshair overflow-auto rounded shadow-sm">
              <canvas
                ref={canvasRef}
                onClick={getColorAt}
                onMouseMove={getColorAt}
                className="max-h-[460px] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Color Details Panel */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Selected Color
        </h3>

        {pickedColor ? (
          <div className="space-y-4">
            {/* Color Swatch */}
            <div
              className="h-20 w-full rounded border border-gray-300 shadow-inner"
              style={{ backgroundColor: pickedColor.hex }}
            />

            {/* HEX */}
            <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase text-gray-500">HEX Code</span>
                <p className="font-mono text-sm font-bold text-[#2b2f52]">{pickedColor.hex}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(pickedColor.hex, "hex")}
                className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
              >
                {copiedKey === "hex" ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                <span>{copiedKey === "hex" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* RGB */}
            <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase text-gray-500">RGB Code</span>
                <p className="font-mono text-sm font-bold text-[#2b2f52]">{pickedColor.rgb}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(pickedColor.rgb, "rgb")}
                className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
              >
                {copiedKey === "rgb" ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                <span>{copiedKey === "rgb" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* HSL */}
            <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase text-gray-500">HSL Code</span>
                <p className="font-mono text-sm font-bold text-[#2b2f52]">{pickedColor.hsl}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(pickedColor.hsl, "hsl")}
                className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
              >
                {copiedKey === "hsl" ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                <span>{copiedKey === "hsl" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
