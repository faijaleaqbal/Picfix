"use client";

import { useState } from "react";
import { Download, FileText, Images, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/config";

interface PageImage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
}

interface PdfJsDoc {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => {
      promise: Promise<void>;
    };
  }>;
}

interface PdfJsGlobal {
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<PdfJsDoc>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPages([]);
    }
  };

  const loadPdfJs = async (): Promise<PdfJsGlobal | null> => {
    if (typeof window === "undefined") return null;
    const win = window as unknown as { pdfjsLib?: PdfJsGlobal };
    if (win.pdfjsLib) return win.pdfjsLib;

    return new Promise((resolve, reject) => {
      const existing = document.getElementById("pdfjs-script");
      if (existing) {
        existing.addEventListener("load", () => {
          resolve((window as unknown as { pdfjsLib?: PdfJsGlobal }).pdfjsLib || null);
        });
        return;
      }
      const script = document.createElement("script");
      script.id = "pdfjs-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const lib = (window as unknown as { pdfjsLib?: PdfJsGlobal }).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        resolve(lib || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setStatusText("Loading PDF engine...");

    try {
      const pdfjsLib = await loadPdfJs();
      if (!pdfjsLib) throw new Error("Could not initialize PDF rendering engine");

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const renderedPages: PageImage[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatusText(`Rendering page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x for sharp HD output

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
        });

        renderedPages.push({ pageNum: i, dataUrl, blob });
      }

      setPages(renderedPages);
      setStatusText("");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to convert PDF to images.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadPage = (p: PageImage) => {
    const a = document.createElement("a");
    a.href = p.dataUrl;
    a.download = `page-${p.pageNum}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    pages.forEach((p, idx) => {
      setTimeout(() => downloadPage(p), idx * 250);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <div className="rounded-md border-[3px] border-dashed border-[#9da0d9] bg-white p-8 text-center hover:border-[#4449A6]">
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-jpg-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a PDF file to convert into JPG images
            </p>
            <label
              htmlFor="pdf-jpg-upload"
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

            {processing && (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Loader2 className="size-8 animate-spin text-[#4449A6]" />
                <p className="text-sm font-semibold text-gray-700">{statusText}</p>
              </div>
            )}

            {pages.length > 0 ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-[#2b2f52]">
                    Converted Pages ({pages.length})
                  </h4>
                  <button
                    type="button"
                    onClick={downloadAll}
                    className="flex items-center gap-1.5 rounded bg-[#047e73] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#036960]"
                  >
                    <Download className="size-3.5" />
                    Download All Pages
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {pages.map((p) => (
                    <div
                      key={p.pageNum}
                      className="flex flex-col items-center rounded border border-gray-200 bg-[#fafbfe] p-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNum}`}
                        className="h-44 w-auto rounded border object-contain shadow-sm"
                      />
                      <div className="mt-2 flex w-full items-center justify-between px-1 text-xs">
                        <span className="font-semibold text-gray-700">Page {p.pageNum}</span>
                        <button
                          type="button"
                          onClick={() => downloadPage(p)}
                          className="flex items-center gap-1 font-bold text-[#4449A6] hover:underline"
                        >
                          <Download className="size-3" />
                          JPG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Convert PDF to JPG
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Extract pages from your PDF and save them as separate high-resolution JPG pictures.
        </p>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleConvert}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Images className="size-4" />
          {processing ? "Converting..." : "Convert to JPG"}
        </button>
      </div>
    </div>
  );
}
