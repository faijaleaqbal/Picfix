"use client";

import { useState } from "react";
import { Download, Eye, EyeOff, Check } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import {
  DownloadButton,
  LoadingIndicator,
  ProcessError,
  ResultMeta,
} from "@/components/site/process-result";
import { useProcessing } from "@/lib/use-processing";
import { DEFAULT_TIMEOUTS } from "@/lib/api";

/**
 * WhatsApp DP workbench.
 *
 * Wired to POST /api/social-resize with platform=whatsapp-dp
 * (500×500 center crop). Padding/blur/fit controls stay
 * presentational until the backend extends the contract.
 */
export function WhatsappDpTool() {
  const [format, setFormat] = useState("jpeg");
  const [maskOn, setMaskOn] = useState(true);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("platform", "whatsapp-dp");
    fd.append("format", format);
    fd.append("quality", "92");
    await state.run("/api/social-resize", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-surface-container-lowest">
      {/* Tool Header */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant bg-surface/50 px-gutter py-stack-md backdrop-blur-sm">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">WhatsApp DP Resize</h1>
          <p className="mt-1 font-body-md text-body-md text-text-secondary">
            Perfectly size your profile picture without cropping out the important parts.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={!file || processing}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="size-4" />
          {processing ? "Working…" : "Resize to 500×500"}
        </button>
      </div>

      {/* Canvas Workspace */}
      <div className="checkerboard-bg relative flex flex-1 items-center justify-center overflow-y-auto p-gutter">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="or click to browse from your device"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
            className="relative z-10 max-w-xl"
          />
        ) : (
          <div className="relative z-10 flex w-full max-w-md flex-col gap-stack-sm">
            <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-outline-variant bg-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl ?? originalUrl ?? ""}
                alt={resultUrl ? "Resized DP" : "Original upload"}
                className="h-full w-full object-contain"
              />
              {/* Circle Overlay (WhatsApp Mask) */}
              {maskOn ? (
                <div className="pointer-events-none absolute inset-0 z-20">
                  <svg
                    height="100%"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                    width="100%"
                    aria-hidden="true"
                  >
                    <defs>
                      <mask id="dp-hole">
                        <rect fill="white" height="100" width="100" />
                        <circle cx="50" cy="50" fill="black" r="48" />
                      </mask>
                    </defs>
                    <rect fill="rgba(0,0,0,0.6)" height="100" mask="url(#dp-hole)" width="100" />
                    <circle
                      className="opacity-80"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="48"
                      stroke="#B48CDE"
                      strokeDasharray="2,2"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Resizing for WhatsApp…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download DP" />
            ) : null}
          </div>
        )}

        {/* Floating Controls Panel */}
        <div className="glass-panel absolute bottom-gutter left-1/2 z-30 flex w-[90%] max-w-sm -translate-x-1/2 flex-col gap-stack-md rounded-xl p-stack-md shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
              Output Format
            </span>
            <select
              value={format}
              aria-label="Output format"
              onChange={(e) => setFormat(e.target.value)}
              className="rounded-md border border-border bg-surface-container-high px-2 py-1 font-label-sm text-label-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-lavender"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-primary">Square 500×500</span>
            <span className="font-label-sm text-label-sm text-text-secondary">
              center-cropped by backend
            </span>
          </div>
        </div>

        {/* Action FABs */}
        <div className="absolute right-gutter top-gutter z-30 flex flex-col gap-2">
          <button
            type="button"
            title="Download"
            aria-label="Download"
            disabled={!result}
            onClick={state.download}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-primary shadow-md transition-colors hover:bg-surface-variant disabled:opacity-40"
          >
            <Download className="size-5" />
          </button>
          <button
            type="button"
            title="Toggle Preview Mask"
            aria-label="Toggle preview mask"
            onClick={() => setMaskOn((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-primary shadow-md transition-colors hover:bg-surface-variant"
          >
            {maskOn ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
