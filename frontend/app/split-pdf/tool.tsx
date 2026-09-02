"use client";

import { useState } from "react";
import { Download, FileText, Scissors } from "lucide-react";
import { splitPdf, createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

export function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState("1-2");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
    }
  };

  const handleSplit = async () => {
    if (!file || !pageRange.trim()) return;
    setProcessing(true);
    try {
      const splitBytes = await splitPdf(file, pageRange);
      setResultBlob(createPdfBlob(splitBytes));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to split PDF. Please check page range.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `split-${file.name}`;
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
              id="pdf-split-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a PDF file to split or extract pages
            </p>
            <label
              htmlFor="pdf-split-upload"
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
                  ✓ Selected Pages Successfully Extracted ({formatBytes(resultBlob.size)})
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Extracted PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Split Options
        </h3>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Page Ranges to Extract
          </label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 8"
            className="w-full rounded border border-gray-300 p-2 text-sm font-semibold outline-none focus:border-[#4449A6]"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            Example: <b>1-4</b> extracts pages 1 to 4. <b>1, 3, 5</b> extracts pages 1, 3, and 5.
          </p>
        </div>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleSplit}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Scissors className="size-4" />
          {processing ? "Extracting Pages..." : "Split PDF"}
        </button>
      </div>
    </div>
  );
}
