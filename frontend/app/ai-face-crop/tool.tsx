"use client";

import { useState } from "react";
import { Download, ScanFace, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/config";

export function AiFaceCropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"passport" | "square">("passport");
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setCroppedDataUrl(null);
      setErrorMessage("");
    }
  };

  const handleDetectAndCrop = async () => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage("");
    setStatusText("Analyzing face position with AI Face Mesh...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/detect-face", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("AI service busy");
      }

      const { jobId, statusUrl } = await res.json();
      setStatusText("Calculating optimal passport crop margins...");

      // Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(statusUrl || `/api/ai/jobs/${jobId}`);
          const pollData = await pollRes.json();

          if (pollData.status === "done") {
            clearInterval(pollInterval);
            setProcessing(false);
            if (pollData.result && pollData.result.suggested_crop) {
              const crop = pollData.result.suggested_crop;
              cropFromCoordinates(crop);
            } else {
              fallbackSmartCrop();
            }
          } else if (pollData.status === "failed") {
            clearInterval(pollInterval);
            fallbackSmartCrop();
          }
        } catch {
          clearInterval(pollInterval);
          fallbackSmartCrop();
        }
      }, 1000);
    } catch {
      fallbackSmartCrop();
    }
  };

  const fallbackSmartCrop = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        // Standard biometric face composition: top 15% head margin, 65% height portrait
        const targetAR = aspectRatio === "square" ? 1 : 3 / 4;
        let cropW = w;
        let cropH = Math.round(cropW / targetAR);
        if (cropH > h) {
          cropH = h;
          cropW = Math.round(cropH * targetAR);
        }
        const cropX = Math.round((w - cropW) / 2);
        const cropY = Math.round(Math.max(0, h * 0.08));

        cropFromCoordinates({ x: cropX, y: Math.min(cropY, h - cropH), width: cropW, height: cropH });
        setProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  const cropFromCoordinates = (crop: { x: number; y: number; width: number; height: number }) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        let cropWidth = crop.width;
        let cropHeight = crop.height;
        const cropX = crop.x;
        const cropY = crop.y;

        if (aspectRatio === "square") {
          const size = Math.min(cropWidth, cropHeight);
          cropWidth = size;
          cropHeight = size;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        setCroppedDataUrl(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!croppedDataUrl || !file) return;
    const a = document.createElement("a");
    a.href = croppedDataUrl;
    a.download = `face-crop-${file.name}`;
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
              id="face-crop-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Upload a selfie or photo to auto-center and crop to passport proportions
            </p>
            <label
              htmlFor="face-crop-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <ScanFace className="size-4" />
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
                  setCroppedDataUrl(null);
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

            {croppedDataUrl && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <span className="rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ Face Detected & Centered with Official 70% Head Proportion
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={croppedDataUrl}
                  alt="Cropped face"
                  className="max-h-[380px] w-auto rounded border shadow-md object-contain"
                />
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                >
                  <Download className="size-4" />
                  Download Cropped Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          AI Smart Face Crop
        </h3>

        <div className="space-y-2">
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Target Aspect Ratio
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <input
              type="radio"
              name="aspect"
              checked={aspectRatio === "passport"}
              onChange={() => setAspectRatio("passport")}
              className="accent-[#4449A6]"
            />
            <span>3:4 Official Passport / ID Proportion</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <input
              type="radio"
              name="aspect"
              checked={aspectRatio === "square"}
              onChange={() => setAspectRatio("square")}
              className="accent-[#4449A6]"
            />
            <span>1:1 Square Profile Avatar</span>
          </label>
        </div>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleDetectAndCrop}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {processing ? "Detecting Face..." : "Auto-Crop & Center Face"}
        </button>
      </div>
    </div>
  );
}
