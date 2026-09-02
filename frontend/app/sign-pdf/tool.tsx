"use client";

import { useState } from "react";
import { Download, FileText, PenTool } from "lucide-react";
import { signPdfDoc, createPdfBlob } from "@/lib/pdf-tools";

export function SignPdfTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setResultBlob(null);
    }
  };

  const handleSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSigFile(e.target.files[0]);
      setResultBlob(null);
    }
  };

  const handleSign = async () => {
    if (!pdfFile || !sigFile) return;
    setProcessing(true);
    try {
      const signedBytes = await signPdfDoc(pdfFile, sigFile, pageNumber);
      setResultBlob(createPdfBlob(signedBytes));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to sign PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !pdfFile) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signed-${pdfFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* PDF File */}
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-700">1. Upload PDF</h4>
            {!pdfFile ? (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded border-[2px] border-dashed border-[#9da0d9] p-4 text-center hover:border-[#4449A6]">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handlePdf}
                />
                <FileText className="size-6 text-red-500" />
                <span className="mt-1 text-xs font-bold text-[#4449A6]">Select PDF File</span>
              </label>
            ) : (
              <div className="flex items-center justify-between rounded bg-[#fafbfe] p-3 text-xs">
                <span className="truncate font-medium">{pdfFile.name}</span>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Signature File */}
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-700">2. Upload Signature Image</h4>
            {!sigFile ? (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded border-[2px] border-dashed border-[#9da0d9] p-4 text-center hover:border-[#4449A6]">
                <input
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleSig}
                />
                <PenTool className="size-6 text-[#047e73]" />
                <span className="mt-1 text-xs font-bold text-[#047e73]">Select Signature (PNG/JPG)</span>
              </label>
            ) : (
              <div className="flex items-center justify-between rounded bg-[#fafbfe] p-3 text-xs">
                <span className="truncate font-medium">{sigFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSigFile(null)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {resultBlob ? (
          <div className="rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
            <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
              ✓ Signature Placed Successfully
            </span>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
              >
                <Download className="size-4" />
                Download Signed PDF
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Sign Document
        </h3>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Page Number to Sign
          </label>
          <input
            type="number"
            min={1}
            value={pageNumber}
            onChange={(e) => setPageNumber(Number(e.target.value) || 1)}
            className="w-full rounded border border-gray-300 p-2 text-sm font-bold outline-none focus:border-[#4449A6]"
          />
        </div>

        <button
          type="button"
          disabled={!pdfFile || !sigFile || processing}
          onClick={handleSign}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <PenTool className="size-4" />
          {processing ? "Signing PDF..." : "Sign PDF Document"}
        </button>
      </div>
    </div>
  );
}
