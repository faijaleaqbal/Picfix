"use client";

import { useState } from "react";
import { Download, FileText, SunMedium } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { createPdfBlob } from "@/lib/pdf-tools";
import { formatBytes } from "@/lib/config";

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

export function GrayscalePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [statusText, setStatusText] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
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

  const handleGrayscale = async () => {
    if (!file) return;
    setProcessing(true);
    setStatusText("Initializing PDF engine...");

    try {
      const pdfjsLib = await loadPdfJs();
      if (!pdfjsLib) throw new Error("Could not initialize PDF rendering engine");

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setStatusText(`Processing page ${i} of ${numPages} to grayscale...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Convert canvas image data to grayscale
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let j = 0; j < data.length; j += 4) {
          const avg = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
          data[j] = avg;
          data[j + 1] = avg;
          data[j + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);

        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const jpgBytes = await fetch(jpgDataUrl).then((r) => r.arrayBuffer());
        const embeddedImg = await newPdf.embedJpg(jpgBytes);

        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const pdfBytes = await newPdf.save();
      setResultBlob(createPdfBlob(pdfBytes));
      setStatusText("");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to convert PDF to grayscale.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grayscale-${file.name}`;
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
              id="pdf-gray-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a color PDF to convert to black & white / grayscale
            </p>
            <label
              htmlFor="pdf-gray-upload"
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
              <div className="mt-6 text-center text-sm font-semibold text-[#4449A6]">
                {statusText}
              </div>
            )}

            {resultBlob ? (
              <div className="mt-6 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
                <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ PDF Converted to Black & White / Grayscale ({formatBytes(resultBlob.size)})
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Grayscale PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Grayscale PDF
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Convert colorful PDF documents into black & white grayscale to save printer toner and comply with mono submission guidelines.
        </p>

        <button
          type="button"
          disabled={!file || processing}
          onClick={handleGrayscale}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <SunMedium className="size-4" />
          {processing ? "Converting..." : "Convert to Grayscale"}
        </button>
      </div>
    </div>
  );
}
