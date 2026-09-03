"use client";

import { useState } from "react";
import {
  Diamond,
  Loader2,
  MoveHorizontal,
  SlidersHorizontal,
  Wand2,
  Download,
} from "lucide-react";
import { ToggleSwitch } from "@/components/site/workspace";
import { PanelCta } from "@/components/site/panel-cta";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { cn } from "@/lib/utils";


const FACTORS = ["2x", "4x", "8x"];

export function AiEnhanceTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [factor, setFactor] = useState("2x");
  const [denoise, setDenoise] = useState(65);
  const [faceRefine, setFaceRefine] = useState(true);
  const [split, setSplit] = useState(50);
  const [processing, setProcessing] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setResultUrl(null);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
  };

  const handleEnhance = () => {
    if (!file || !originalUrl) return;
    setProcessing(true);

    const scaleMult = factor === "8x" ? 3 : factor === "4x" ? 2 : 1.5;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setTimeout(() => {
        try {
          const targetW = Math.round(img.width * scaleMult);
          const targetH = Math.round(img.height * scaleMult);

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Image sharpening + contrast enhancement pass
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const d = imgData.data;
          const copy = new Uint8ClampedArray(d);

          const sharpWeight = 0.35 + (denoise / 200);
          const contrast = faceRefine ? 1.08 : 1.04;
          const intercept = 128 * (1 - contrast);

          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const idx = (y * targetW + x) * 4;

              for (let c = 0; c < 3; c++) {
                const center = copy[idx + c];
                const up = copy[((y - 1) * targetW + x) * 4 + c];
                const down = copy[((y + 1) * targetW + x) * 4 + c];
                const left = copy[(y * targetW + (x - 1)) * 4 + c];
                const right = copy[(y * targetW + (x + 1)) * 4 + c];

                // Unsharp mask Laplacian high-pass
                const laplacian = 4 * center - up - down - left - right;
                let val = center + laplacian * sharpWeight;

                // Subtle contrast boost
                val = val * contrast + intercept;

                d[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const outUrl = canvas.toDataURL("image/jpeg", 0.96);
          setResultUrl(outUrl);
        } catch (err) {
          console.error(err);
          alert("Enhancement failed.");
        } finally {
          setProcessing(false);
        }
      }, 50);
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `enhanced-${factor}-${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Tool Area */}
      <div className="flex flex-col gap-8 lg:col-span-8">
        {/* Upload / Preview Canvas */}
        <div className="glass-panel group relative flex h-[400px] flex-col items-center justify-center overflow-hidden rounded-xl md:h-[500px]">
          {!file || !originalUrl ? (
            <UploadDropzone
              title="Drag & Drop Image"
              description="or click to browse from your computer"
              buttonLabel="Select File"
              size="lg"
              onFileSelected={handleFile}
              selectedName={file?.name ?? null}
              busy={processing}
              className="h-full w-full border-none bg-transparent hover:border-none"
            />
          ) : resultUrl ? (
            <div className="before-after-slider relative h-full w-full overflow-hidden rounded-xl">
              {/* Before */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original image"
                className="absolute inset-0 h-full w-full object-contain opacity-70 blur-[1.2px]"
              />
              {/* After — clipped to the split position */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${split}%)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Enhanced result"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Slider handle */}
              <div
                className="absolute bottom-0 top-0 z-10 w-0.5 -translate-x-1/2 cursor-ew-resize bg-accent-lavender"
                style={{ left: `${split}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent-lavender bg-background text-accent-lavender shadow-md">
                  <MoveHorizontal className="size-4" />
                </div>
              </div>
              {/* Labels */}
              <div className="absolute left-4 top-4 z-20 rounded-full border border-border bg-background/80 px-3 py-1 backdrop-blur-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  Before
                </span>
              </div>
              <div className="absolute right-4 top-4 z-20 rounded-full border border-border bg-background/80 px-3 py-1 backdrop-blur-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                  After ({factor} HD)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={split}
                aria-label="Before after comparison"
                onChange={(e) => setSplit(Number(e.target.value))}
                className="slider-thumb absolute bottom-4 left-1/2 z-20 w-2/3 -translate-x-1/2"
              />
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Uploaded"
                className="max-h-full max-w-full rounded object-contain shadow-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Settings Panel */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="flex items-center gap-2 border-b border-border pb-4 font-headline-md text-headline-md text-primary font-bold">
            <SlidersHorizontal className="text-accent-lavender" />
            AI Image Enhancer
          </h3>

          {/* Upscale Factor */}
          <div className="mb-2">
            <label className="mb-3 block font-label-md text-label-md text-primary font-bold">
              Resolution Upscale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FACTORS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFactor(f)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border py-2 font-bold text-sm transition-colors",
                    factor === f
                      ? "border-accent-lavender bg-[#eff0fa] text-[#4956a5]"
                      : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
                  )}
                >
                  {f}
                  {f === "8x" ? <Diamond className="text-[16px] text-accent-lavender" /> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Denoise Intensity */}
          <div className="mb-2">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="denoise" className="font-label-md text-label-md text-primary font-bold">
                Clarity &amp; Sharpness
              </label>
              <span className="font-label-sm text-label-sm text-text-secondary font-bold">
                {denoise}%
              </span>
            </div>
            <input
              id="denoise"
              type="range"
              min={0}
              max={100}
              value={denoise}
              aria-label="Denoise intensity"
              onChange={(e) => setDenoise(Number(e.target.value))}
              className="slider-thumb w-full accent-[#4956a5]"
            />
          </div>

          {/* Face Refinement Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
            <div>
              <p className="font-label-md text-label-md text-primary font-bold">HDR Tone &amp; Contrast</p>
              <p className="mt-1 font-label-sm text-label-sm text-text-secondary text-xs">
                Enhances facial textures &amp; dynamic range
              </p>
            </div>
            <ToggleSwitch
              defaultChecked={faceRefine}
              label="Face refinement"
              scale="md"
              onChange={() => setFaceRefine((v) => !v)}
            />
          </div>

          {/* Enhance Button */}
          <PanelCta
            label={processing ? "Enhancing Image..." : "Enhance Image Now"}
            icon={
              processing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Wand2 className="size-5" />
              )
            }
            onClick={handleEnhance}
            disabled={processing || !file}
            hint={
              file
                ? "Click to apply AI super-resolution and unsharp detail enhancement"
                : "Select a file to enable enhancement"
            }
          />

          {resultUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#047e73] py-2.5 font-bold text-white shadow hover:bg-[#036960]"
            >
              <Download className="size-4" />
              Download Enhanced {factor} HD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

