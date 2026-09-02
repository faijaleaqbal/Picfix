"use client";

import { useState } from "react";
import { Download, ArrowUpRight } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { formatBytes } from "@/lib/config";

const CHIPS = [20, 50, 100, 200];

export function IncreaseImageSizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState(50);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
  };

  const runIncrease = async () => {
    if (!file) return;

    const targetBytes = targetKb * 1024;
    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength >= targetBytes) {
      // Already bigger or equal
      const blob = new Blob([arrayBuffer], { type: file.type || "image/jpeg" });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      return;
    }

    // Need to pad bytes safely
    const bytesNeeded = targetBytes - arrayBuffer.byteLength;
    const padding = new Uint8Array(bytesNeeded);
    // Fill with zeroes or comment data
    for (let i = 0; i < bytesNeeded; i++) {
      padding[i] = 0;
    }

    const combined = new Blob([arrayBuffer, padding], {
      type: file.type || "image/jpeg",
    });

    setResultBlob(combined);
    setResultUrl(URL.createObjectURL(combined));
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `increased-${targetKb}kb-${file.name}`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Image Here"
            description="Upload an image to increase its file size in KB"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={handleFile}
          />
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-6">
            <h4 className="mb-2 text-sm font-bold text-[#2b2f52]">
              Uploaded File: {file.name}
            </h4>
            <p className="text-xs text-gray-500">
              Current File Size: <span className="font-bold text-gray-800">{formatBytes(file.size)}</span>
            </p>

            {resultBlob ? (
              <div className="mt-4 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-4 text-center">
                <div className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ Size Successfully Increased to {formatBytes(resultBlob.size)}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Increased File
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Increase Size Settings
        </h3>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Target File Size (KB)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={10000}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value) || 10)}
              className="w-full rounded border border-gray-300 p-2 text-sm font-bold outline-none focus:border-[#4449A6]"
            />
            <span className="text-xs font-bold text-gray-500">KB</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => setTargetKb(kb)}
                className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                  targetKb === kb
                    ? "border-[#4449A6] bg-[#eff0fa] text-[#4449A6]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {kb} KB
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!file}
          onClick={runIncrease}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <ArrowUpRight className="size-4" />
          Increase Image Size
        </button>
      </div>
    </div>
  );
}
