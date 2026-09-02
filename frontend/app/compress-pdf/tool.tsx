"use client";

import { useState } from "react";
import { Download, FileText, Minimize2 } from "lucide-react";
import { compressPdfDoc, createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const compressedBytes = await compressPdfDoc(file);
      setResultBlob(createPdfBlob(compressedBytes));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savedPercent =
    resultBlob && file && file.size > resultBlob.size
      ? Math.round(((file.size - resultBlob.size) / file.size) * 100)
      : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center hover:border-[#4449A6]">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-compress-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a PDF file to compress and optimize
            </p>
            <label
              htmlFor="pdf-compress-upload"
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
                <span className="text-xs text-gray-500">Original Size: {formatBytes(file.size)}</span>
              </div>
            </div>

            {resultBlob ? (
              <div className="mt-6 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
                <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ PDF Successfully Compressed to {formatBytes(resultBlob.size)}
                  {savedPercent ? ` (−${savedPercent}%)` : ""}
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Compressed PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Compress PDF
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Reduce PDF file size while maintaining the best document quality. Optimizes embedded fonts, streams, and vector graphics.
        </p>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleCompress}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Minimize2 className="size-4" />
          {processing ? "Compressing PDF..." : "Compress PDF"}
        </button>
      </div>
    </div>
  );
}
