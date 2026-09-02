"use client";

import { useState, useRef } from "react";
import { Download, Palette, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/config";

const COLOR_PRESETS = [
  { name: "Official White (Passport/SSC/Govt)", hex: "#FFFFFF", border: "border-gray-300" },
  { name: "Official Light Blue (Visa/Intl)", hex: "#4A90E2", border: "border-blue-400" },
  { name: "Soft Cyan Blue", hex: "#BCE0FD", border: "border-blue-200" },
  { name: "Studio Light Grey", hex: "#E5E7EB", border: "border-gray-400" },
  { name: "Navy Blue", hex: "#1E3A8A", border: "border-blue-900" },
  { name: "Soft Cream", hex: "#FEF3C7", border: "border-amber-200" },
  { name: "Transparent (PNG)", hex: "transparent", border: "border-dashed border-gray-400" },
];

export function ChangePhotoBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [cutoutBlobUrl, setCutoutBlobUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setCutoutBlobUrl(null);
      setErrorMessage("");
    }
  };

  const handleProcessBackground = async () => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage("");
    setStatusText("Submitting photo to AI segmentation engine...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const { jobId, statusUrl } = await res.json();
      setStatusText("Removing background & isolating person...");

      // Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(statusUrl || `/api/ai/jobs/${jobId}`);
          const pollData = await pollRes.json();

          if (pollData.status === "done") {
            clearInterval(pollInterval);
            const resultRes = await fetch(`/api/ai/jobs/${jobId}/result`);
            const blob = await resultRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            setCutoutBlobUrl(blobUrl);
            setProcessing(false);
            renderComposite(blobUrl, selectedColor);
          } else if (pollData.status === "failed") {
            clearInterval(pollInterval);
            setProcessing(false);
            setErrorMessage(pollData.error || "Failed to remove background.");
          }
        } catch (pollErr) {
          console.error(pollErr);
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : "Background processing failed.");
    }
  };

  const renderComposite = (cutoutUrl: string, bgColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
    };
    img.src = cutoutUrl;
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (cutoutBlobUrl) {
      renderComposite(cutoutBlobUrl, color);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;

    const format = selectedColor === "transparent" ? "image/png" : "image/jpeg";
    const ext = selectedColor === "transparent" ? "png" : "jpg";
    const dataUrl = canvas.toDataURL(format, 0.95);

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `passport-bg-${file.name.replace(/\.[^/.]+$/, "")}.${ext}`;
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
              id="bg-change-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Upload a portrait or passport photo to change its background color
            </p>
            <label
              htmlFor="bg-change-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <Palette className="size-4" />
              <span>Select Photo</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#2b2f52]">{file.name}</h4>
                <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setCutoutBlobUrl(null);
                }}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Change Photo
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {processing && (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Loader2 className="size-8 animate-spin text-[#4449A6]" />
                <p className="text-sm font-semibold text-gray-700">{statusText}</p>
              </div>
            )}

            <div className={`mt-4 flex max-h-[500px] w-full items-center justify-center overflow-auto rounded border border-gray-200 bg-[#f8f9fc] p-3 ${!cutoutBlobUrl ? "hidden" : ""}`}>
              <canvas
                ref={canvasRef}
                className="max-h-[460px] w-auto rounded object-contain shadow-md"
              />
            </div>

            {cutoutBlobUrl && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                >
                  <Download className="size-4" />
                  Download Passport Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Choose Background Color
        </h3>

        <div className="space-y-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleColorChange(preset.hex)}
              className={`flex w-full items-center gap-3 rounded border p-2.5 text-left text-xs font-semibold transition-all ${
                selectedColor === preset.hex
                  ? "border-[#4449A6] bg-[#eff0fa] text-[#4449A6]"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span
                className={`size-6 rounded-full border shadow-inner shrink-0 ${preset.border}`}
                style={{ backgroundColor: preset.hex === "transparent" ? "#ffffff" : preset.hex }}
              />
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 border-t pt-3">
          <label className="mb-1 block text-xs font-bold text-gray-700">Custom Color Picker</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                handleColorChange(e.target.value);
              }}
              className="size-9 cursor-pointer rounded border p-0.5"
            />
            <span className="text-xs font-mono font-bold text-gray-600 uppercase">
              {customColor}
            </span>
          </div>
        </div>

        {!cutoutBlobUrl && (
          <button
            type="button"
            disabled={!file || processing}
            onClick={handleProcessBackground}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {processing ? "Processing AI Cutout..." : "Apply Background Color"}
          </button>
        )}
      </div>
    </div>
  );
}
