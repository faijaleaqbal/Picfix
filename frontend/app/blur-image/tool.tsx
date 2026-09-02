"use client";

import { useState, useRef, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";

export function BlurImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [blurRadius, setBlurRadius] = useState(8);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setSrc(URL.createObjectURL(f));
  };

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    };
  }, [src, blurRadius]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blurred-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Image to Blur"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={handleFile}
          />
        ) : (
          <div className="flex flex-col items-center rounded-md border border-[#d9dcea] bg-[#fafbfe] p-4">
            <h4 className="mb-3 text-sm font-bold text-[#2b2f52]">Blurred Preview</h4>
            <div className="max-h-[500px] overflow-auto rounded shadow-sm">
              <canvas ref={canvasRef} className="max-h-[460px] w-auto max-w-full object-contain" />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSrc(null);
                }}
                className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="size-3.5" />
                Change Image
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded bg-[#047e73] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#036960]"
              >
                <Download className="size-4" />
                Download Blurred Image
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Blur Settings
        </h3>

        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-600">
            <span>Blur Strength</span>
            <span>{blurRadius}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={40}
            value={blurRadius}
            onChange={(e) => setBlurRadius(Number(e.target.value))}
            className="w-full accent-[#4449A6]"
          />
        </div>

        <button
          type="button"
          disabled={!file}
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Download className="size-4" />
          Download Blurred Image
        </button>
      </div>
    </div>
  );
}
