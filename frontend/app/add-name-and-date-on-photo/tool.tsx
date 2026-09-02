"use client";

import { useState, useRef, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";

export function AddNameDatePhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("CANDIDATE NAME");
  const [dateText, setDateText] = useState(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `DOB: ${day}-${month}-${year}`;
  });
  const [stripHeight, setStripHeight] = useState(22); // percent
  const [fontSize, setFontSize] = useState(24);
  const textColor = "#000000";
  const bgColor = "#ffffff";

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewSrc(url);
  };

  useEffect(() => {
    if (!previewSrc || !canvasRef.current) return;

    const img = new Image();
    img.src = previewSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 500;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Strip height calculation
      const stripH = Math.round((canvas.height * stripHeight) / 100);
      const stripY = canvas.height - stripH;

      // Draw strip background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, stripY, canvas.width, stripH);

      // Divider line
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, stripY);
      ctx.lineTo(canvas.width, stripY);
      ctx.stroke();

      // Text settings
      const calculatedFontSize = Math.max(14, Math.round((canvas.width / 400) * fontSize));
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${calculatedFontSize}px Arial, sans-serif`;

      if (candidateName && dateText) {
        // Two lines
        const line1Y = stripY + stripH * 0.35;
        const line2Y = stripY + stripH * 0.75;
        ctx.fillText(candidateName.toUpperCase(), canvas.width / 2, line1Y);
        ctx.font = `bold ${Math.round(calculatedFontSize * 0.85)}px Arial, sans-serif`;
        ctx.fillText(dateText, canvas.width / 2, line2Y);
      } else if (candidateName || dateText) {
        // Single line
        ctx.fillText((candidateName || dateText).toUpperCase(), canvas.width / 2, stripY + stripH / 2);
      }
    };
  }, [previewSrc, candidateName, dateText, stripHeight, fontSize, textColor, bgColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-with-name-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Preview Area */}
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Passport Photo"
            description="Upload passport photo to add Name and Date of Photo (DOP / DOB)"
            buttonLabel="Select Photo"
            size="lg"
            onFileSelected={handleFile}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-[#d9dcea] bg-[#fafbfe] p-6 text-center">
            <h4 className="mb-4 text-sm font-bold text-[#2b2f52]">
              Live Canvas Preview
            </h4>
            <div className="max-h-[500px] overflow-hidden rounded shadow-md">
              <canvas ref={canvasRef} className="max-h-[480px] w-auto max-w-full object-contain" />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewSrc(null);
                }}
                className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="size-3.5" />
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded bg-[#047e73] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#036960]"
              >
                <Download className="size-4" />
                Download Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Sidebar */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Name & Date Settings
        </h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. AMIT SHARMA"
              className="w-full rounded border border-gray-300 p-2 text-sm uppercase outline-none focus:border-[#4449A6]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
              Date of Photo / DOB
            </label>
            <input
              type="text"
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder="e.g. DOP: 01-09-2026"
              className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-[#4449A6]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Strip Height</span>
              <span>{stripHeight}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={35}
              value={stripHeight}
              onChange={(e) => setStripHeight(Number(e.target.value))}
              className="w-full accent-[#4449A6]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Font Size</span>
              <span>{fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={40}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#4449A6]"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!file}
          onClick={handleDownload}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Download className="size-4" />
          Download Photo
        </button>
      </div>
    </div>
  );
}
