"use client";

import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";

export function MergePhotoSignatureTool() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);

  const [gap, setGap] = useState(15);
  const [padding, setPadding] = useState(20);
  const [borderWidth, setBorderWidth] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePhoto = (f: File) => {
    setPhotoFile(f);
    setPhotoUrl(URL.createObjectURL(f));
  };

  const handleSig = (f: File) => {
    setSigFile(f);
    setSigUrl(URL.createObjectURL(f));
  };

  useEffect(() => {
    if (!photoUrl || !sigUrl || !canvasRef.current) return;

    const imgPhoto = new Image();
    const imgSig = new Image();

    imgPhoto.src = photoUrl;
    imgSig.src = sigUrl;

    let loaded = 0;
    const checkDraw = () => {
      loaded++;
      if (loaded === 2) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Target canvas width = 450px
        const targetW = 450;
        const innerW = targetW - padding * 2;

        // Scale photo
        const photoH = Math.round((innerW / imgPhoto.naturalWidth) * imgPhoto.naturalHeight);
        // Scale signature (cap max height to 120px)
        let sigH = Math.round((innerW / imgSig.naturalWidth) * imgSig.naturalHeight);
        if (sigH > 150) sigH = 150;

        const totalH = padding * 2 + photoH + gap + sigH;

        canvas.width = targetW;
        canvas.height = totalH;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Photo
        ctx.drawImage(imgPhoto, padding, padding, innerW, photoH);

        // Draw Signature
        const sigY = padding + photoH + gap;
        ctx.drawImage(imgSig, padding, sigY, innerW, sigH);

        // Draw border if requested
        if (borderWidth > 0) {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);
          // Separator line
          ctx.beginPath();
          ctx.moveTo(padding, sigY - gap / 2);
          ctx.lineTo(targetW - padding, sigY - gap / 2);
          ctx.strokeStyle = "#e0e0e0";
          ctx.stroke();
        }
      }
    };

    imgPhoto.onload = checkDraw;
    imgSig.onload = checkDraw;
  }, [photoUrl, sigUrl, gap, padding, borderWidth]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-signature-merged-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Photo Uploader */}
          <div className="rounded-md border border-[#d9dcea] bg-white p-3">
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-700">1. Upload Photo</h4>
            {!photoFile ? (
              <UploadDropzone
                title="Select Photo"
                buttonLabel="Choose Photo"
                onFileSelected={handlePhoto}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl!} alt="Photo" className="h-32 rounded object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoUrl(null);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove & Reselect
                </button>
              </div>
            )}
          </div>

          {/* Signature Uploader */}
          <div className="rounded-md border border-[#d9dcea] bg-white p-3">
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-700">2. Upload Signature</h4>
            {!sigFile ? (
              <UploadDropzone
                title="Select Signature"
                buttonLabel="Choose Signature"
                onFileSelected={handleSig}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sigUrl!} alt="Signature" className="h-32 rounded object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setSigFile(null);
                    setSigUrl(null);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove & Reselect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Merged Result */}
        {photoUrl && sigUrl ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-[#d9dcea] bg-[#fafbfe] p-6">
            <h4 className="mb-3 text-sm font-bold text-[#2b2f52]">Merged Preview</h4>
            <div className="shadow-lg">
              <canvas ref={canvasRef} className="max-h-[500px] w-auto max-w-full rounded object-contain" />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
            >
              <Download className="size-4" />
              Download Merged JPG
            </button>
          </div>
        ) : (
          <div className="rounded border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500">
            Please upload both Photo and Signature above to generate the combined preview.
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Merge Options
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Card Padding</span>
              <span>{padding}px</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full accent-[#4449A6]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Gap Between Photo & Sign</span>
              <span>{gap}px</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-[#4449A6]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Outer Border</span>
              <span>{borderWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={4}
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              className="w-full accent-[#4449A6]"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!photoUrl || !sigUrl}
          onClick={handleDownload}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Download className="size-4" />
          Download Merged File
        </button>
      </div>
    </div>
  );
}
