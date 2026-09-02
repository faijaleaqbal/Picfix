"use client";

import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { ToolPanel, PanelFooterActions } from "@/components/site/tool-panel";
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
 * (500×500 center crop).
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Canvas Workspace */}
      <div className="relative flex min-h-[260px] max-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-black/90 p-4 sm:p-6 md:max-h-none md:p-8">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Profile Picture"
            description="or tap to browse from your device"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
            className="relative z-10 max-w-xl"
          />
        ) : (
          <div className="relative z-10 flex max-h-full w-full max-w-md flex-col items-center gap-3 overflow-y-auto">
            {/* Aspect Square Preview with circular mask overlay */}
            <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[380px] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultUrl ?? originalUrl ?? ""}
                alt={resultUrl ? "Resized WhatsApp DP" : "Original upload"}
                className="h-full w-full object-contain"
              />
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
                      strokeWidth="0.75"
                    />
                  </svg>
                </div>
              ) : null}

              {/* Mask toggle overlay button */}
              <button
                type="button"
                title="Toggle Circular Preview"
                aria-label="Toggle circular preview"
                onClick={() => setMaskOn((v) => !v)}
                className="absolute right-3 top-3 z-30 flex size-9 items-center justify-center rounded-full bg-surface/85 text-primary shadow-md backdrop-blur-md transition-colors hover:bg-surface"
              >
                {maskOn ? <Eye className="size-4 text-accent-lavender" /> : <EyeOff className="size-4 text-text-secondary" />}
              </button>
            </div>

            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Resizing to 500×500 WhatsApp DP…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download WhatsApp DP" />
            ) : null}
          </div>
        )}
      </div>

      {/* Settings ToolPanel */}
      <ToolPanel
        title="WhatsApp DP Settings"
        description="Fit square 500×500 dimensions for WhatsApp profile picture."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={state.reset}
            applyLabel={processing ? "Resizing…" : "Resize to 500×500"}
            onApply={run}
            disabled={!file}
            loading={processing}
            applyIcon={<Check className="size-4" />}
          />
        }
      >
        <div className="space-y-4">
          {/* Target resolution card */}
          <div className="rounded-xl border border-accent-lavender/30 bg-accent-lavender/10 p-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-xs font-semibold text-primary">Dimensions</span>
              <span className="rounded bg-accent-lavender/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent-lavender">
                500 × 500 px
              </span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Center-crops without stretching to fit WhatsApp&apos;s circular contact photo frame.
            </p>
          </div>

          {/* Mask toggle control */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-container-low p-3">
            <div>
              <span className="block font-label-md text-xs font-semibold text-primary">
                Circular Preview Guide
              </span>
              <span className="text-[11px] text-text-secondary">
                Simulate circular avatar crop
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMaskOn((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-container px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted"
            >
              {maskOn ? <Eye className="size-3.5 text-accent-lavender" /> : <EyeOff className="size-3.5 text-text-secondary" />}
              <span>{maskOn ? "Mask On" : "Mask Off"}</span>
            </button>
          </div>

          {/* Format selection */}
          <div className="space-y-2 border-t border-border pt-4">
            <label htmlFor="dp-format" className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Output Format
            </label>
            <select
              id="dp-format"
              value={format}
              aria-label="Output format"
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-container px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-accent-lavender"
            >
              <option value="jpeg">JPEG (High compatibility)</option>
              <option value="png">PNG (Lossless crisp graphics)</option>
              <option value="webp">WebP (Optimized size)</option>
            </select>
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}
