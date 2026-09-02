"use client";

import { useState } from "react";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { mergePdfs, createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
      setFiles((prev) => [...prev, ...newFiles]);
      setResultBlob(null);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResultBlob(null);
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
    setResultBlob(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    try {
      const mergedBytes = await mergePdfs(files);
      setResultBlob(createPdfBlob(mergedBytes));
    } catch (err) {
      console.error(err);
      alert("Failed to merge PDFs. Please ensure all files are valid PDF documents.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merged-document-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-6 text-center hover:border-[#4449A6]">
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            id="pdf-upload"
            className="hidden"
            onChange={handleFiles}
          />
          <p className="mb-3 text-base font-medium text-[#6e6e6e]">
            Select Multiple PDF files to combine
          </p>
          <label
            htmlFor="pdf-upload"
            className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
          >
            <Plus className="size-4" />
            <span>Select PDF Files</span>
          </label>
        </div>

        {/* Files List */}
        {files.length > 0 ? (
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-[#2b2f52]">
                Selected PDFs ({files.length})
              </h4>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs text-red-600 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between rounded border border-gray-200 bg-[#fafbfe] p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4449A6] text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <FileText className="size-4 shrink-0 text-red-500" />
                    <span className="truncate font-medium text-gray-800">{file.name}</span>
                    <span className="text-gray-400">({formatBytes(file.size)})</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveFile(idx, -1)}
                        className="p-1 text-gray-500 hover:text-black"
                        title="Move Up"
                      >
                        ▲
                      </button>
                    )}
                    {idx < files.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveFile(idx, 1)}
                        className="p-1 text-gray-500 hover:text-black"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resultBlob ? (
          <div className="rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
            <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
              ✓ PDF Files Successfully Merged ({formatBytes(resultBlob.size)})
            </span>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
              >
                <Download className="size-4" />
                Download Merged PDF
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Merge PDF
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Combine multiple PDF files into one unified document in seconds. Reorder documents up or down to set the exact page sequence.
        </p>

        <button
          type="button"
          disabled={files.length < 2 || processing}
          onClick={handleMerge}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          {processing ? "Merging PDFs..." : "Merge PDF Files"}
        </button>
      </div>
    </div>
  );
}
