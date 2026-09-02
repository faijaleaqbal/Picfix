"use client";

import { useState } from "react";
import { Download, FileText, Copy, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/config";

export function ImageToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setExtractedText("");
      setConfidence(null);
      setErrorMessage("");
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage("");
    setStatusText("Submitting image for AI OCR analysis...");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const { jobId, statusUrl } = await res.json();
      setStatusText("Extracting English & Hindi text...");

      // Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(statusUrl || `/api/ai/jobs/${jobId}`);
          const pollData = await pollRes.json();

          if (pollData.status === "done") {
            clearInterval(pollInterval);
            setProcessing(false);
            if (pollData.result) {
              setExtractedText(pollData.result.text || "No readable text detected in this image.");
              if (pollData.result.confidence) {
                setConfidence(Math.round(pollData.result.confidence * 100));
              }
            } else {
              setExtractedText("No readable text found.");
            }
          } else if (pollData.status === "failed") {
            clearInterval(pollInterval);
            setProcessing(false);
            setErrorMessage(pollData.error || "Failed to extract text.");
          }
        } catch (pollErr) {
          console.error(pollErr);
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : "OCR failed. Please try again.");
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
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
              accept="image/*"
              id="ocr-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Upload a picture, document, invoice, book page, or sign to extract text
            </p>
            <label
              htmlFor="ocr-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <FileText className="size-4" />
              <span>Select Image</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="size-12 rounded border object-cover"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold text-[#2b2f52]">{file.name}</h4>
                  <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  setExtractedText("");
                }}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Change Image
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

            {extractedText && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#2b2f52]">Extracted Text</h4>
                    {confidence !== null && (
                      <span className="rounded-full bg-[#e6f5ec] px-2.5 py-0.5 text-[11px] font-bold text-[#1d7a44]">
                        {confidence}% Accuracy
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 rounded bg-[#eff0fa] px-3 py-1.5 text-xs font-bold text-[#4449A6] hover:bg-[#e0e2f5]"
                    >
                      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1 rounded bg-[#047e73] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#036960]"
                    >
                      <Download className="size-3.5" />
                      Download .TXT
                    </button>
                  </div>
                </div>

                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  rows={8}
                  className="w-full rounded border border-gray-300 p-3 text-sm leading-relaxed text-gray-800 outline-none focus:border-[#4449A6]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          AI Image to Text (OCR)
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Extract printed or handwritten text from any photo, receipt, PDF screenshot, or signboard using multilingual AI optical character recognition.
        </p>

        <div className="rounded bg-[#eff0fa] p-3 text-[11px] text-[#4449A6]">
          🌐 <b>Supported Languages:</b> English & Hindi text with automatic punctuation and spacing detection.
        </div>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleExtract}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {processing ? "Extracting Text..." : "Extract Text"}
        </button>
      </div>
    </div>
  );
}
