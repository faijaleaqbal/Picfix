"use client";

import { useState } from "react";
import { Download, FileText, Crop } from "lucide-react";
import { cropPdfDoc, createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

export function CropPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [margin, setMargin] = useState(36);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
    }
  };

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const croppedBytes = await cropPdfDoc(file, margin);
      setResultBlob(createPdfBlob(croppedBytes));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cropped-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center hover:border-[#4449A6]">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-crop-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a PDF file to trim and crop margins
            </p>
            <label
              htmlFor="pdf-crop-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <span>Select PDF File</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-6">
            <div className="flex items-center gap-3">
              <FileText className="size-8 text-red-500" />
              <div>
                <h4 className="text-sm font-bold text-[#2b2f52]">{file.name}</h4>
                <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
              </div>
            </div>

            {resultBlob ? (
              <div className="mt-6 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
                <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ Margins Successfully Cropped ({margin}pt trimmed)
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Cropped PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Crop Margin Size
        </h3>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <input
              type="radio"
              name="margin"
              checked={margin === 18}
              onChange={() => setMargin(18)}
              className="accent-[#4449A6]"
            />
            <span>Light Trim (18pt / ~0.25 inch)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <input
              type="radio"
              name="margin"
              checked={margin === 36}
              onChange={() => setMargin(36)}
              className="accent-[#4449A6]"
            />
            <span>Standard Trim (36pt / ~0.5 inch)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 p-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <input
              type="radio"
              name="margin"
              checked={margin === 54}
              onChange={() => setMargin(54)}
              className="accent-[#4449A6]"
            />
            <span>Aggressive Trim (54pt / ~0.75 inch)</span>
          </label>
        </div>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleCrop}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Crop className="size-4" />
          {processing ? "Cropping PDF..." : "Crop PDF Margins"}
        </button>
      </div>
    </div>
  );
}
