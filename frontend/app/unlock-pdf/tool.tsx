"use client";

import { useState } from "react";
import { Download, FileText, Unlock, Eye, EyeOff, Lock, AlertCircle, Loader2 } from "lucide-react";
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
  getDocument: (options: { data: ArrayBuffer; password?: string }) => {
    promise: Promise<PdfJsDoc>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  PasswordResponses?: {
    NEED_PASSWORD: 1;
    INCORRECT_PASSWORD: 2;
  };
}

export function UnlockPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultBlob(null);
      setErrorMessage("");
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

  const handleUnlock = async () => {
    if (!file) return;
    setProcessing(true);
    setErrorMessage("");
    setStatusText("Verifying and decrypting PDF...");

    try {
      const pdfjsLib = await loadPdfJs();
      if (!pdfjsLib) throw new Error("Could not initialize PDF decryption engine");

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password.trim(),
      });

      let pdf: PdfJsDoc;
      try {
        pdf = await loadingTask.promise;
      } catch (authErr: unknown) {
        const errStr = authErr instanceof Error ? authErr.message : String(authErr);
        if (errStr.toLowerCase().includes("password") || errStr.toLowerCase().includes("auth")) {
          throw new Error("Incorrect password. Please verify your password and try again.");
        }
        throw authErr;
      }

      const numPages = pdf.numPages;
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setStatusText(`Unlocking and processing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
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

      const unlockedBytes = await newPdf.save();
      setResultBlob(createPdfBlob(unlockedBytes));
      setStatusText("");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to unlock PDF. Please verify your password and try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unlocked-${file.name}`;
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
              id="pdf-unlock-upload"
              className="hidden"
              onChange={handleFile}
            />
            <p className="mb-3 text-base font-medium text-[#6e6e6e]">
              Select a password-protected PDF file to unlock
            </p>
            <label
              htmlFor="pdf-unlock-upload"
              className="btnsel inline-flex cursor-pointer items-center justify-center gap-2"
            >
              <Lock className="size-4" />
              <span>Select Protected PDF</span>
            </label>
          </div>
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="size-8 text-red-500" />
                <div>
                  <h4 className="text-sm font-bold text-[#2b2f52]">{file.name}</h4>
                  <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResultBlob(null);
                  setPassword("");
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Change File
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {processing && (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 py-6 text-center">
                <Loader2 className="size-7 animate-spin text-[#4449A6]" />
                <p className="text-sm font-semibold text-gray-700">{statusText}</p>
              </div>
            )}

            {resultBlob ? (
              <div className="mt-6 rounded-md border border-[#e3e4ef] bg-[#fafbfe] p-6 text-center">
                <span className="inline-block rounded-full bg-[#e6f5ec] px-3 py-1 text-xs font-bold text-[#1d7a44]">
                  ✓ Password Removed Successfully! File is now completely unlocked.
                </span>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 rounded bg-[#047e73] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960]"
                  >
                    <Download className="size-4" />
                    Download Unlocked PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Unlock PDF
        </h3>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Document Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password"
              className="w-full rounded border border-gray-300 p-2.5 pr-10 text-sm font-semibold outline-none focus:border-[#4449A6]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
            Enter the password once. Our engine permanently decrypts the PDF so you never have to type the password again.
          </p>
        </div>

        <div className="rounded bg-[#eff0fa] p-3 text-[11px] text-[#4449A6]">
          🔒 <b>100% Private & Client-Side:</b> Your password and documents are processed locally in your browser. They are never uploaded or stored on any server.
        </div>

        <button
          type="button"
          disabled={!file || !password.trim() || processing}
          onClick={handleUnlock}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded bg-[#4956a5] py-2.5 font-bold text-white shadow hover:bg-[#3d4890] disabled:opacity-50"
        >
          <Unlock className="size-4" />
          {processing ? "Unlocking PDF..." : "Remove Password & Unlock"}
        </button>
      </div>
    </div>
  );
}
