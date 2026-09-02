"use client";

import { Download } from "lucide-react";
import { ToolPanel, PanelFooterActions } from "@/components/site/tool-panel";
import { EditorToolbar } from "@/components/site/workspace";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import {
  DownloadButton,
  LoadingIndicator,
  ProcessError,
  ResultMeta,
} from "@/components/site/process-result";
import { useProcessing } from "@/lib/use-processing";
import { DEFAULT_TIMEOUTS } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Grayscale workbench.
 *
 * Wired to POST /api/grayscale — no extra params beyond the image.
 * The three presets map to the same endpoint (pure grayscale); the
 * contrast/brightness sliders stay presentational until the backend
 * supports tone adjustments.
 */
export function GrayscaleTool() {
  const state = useProcessing();
  const { file, result, resultUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    await state.run("/api/grayscale", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:overflow-hidden">
      {/* Responsive Editor Header Bar — prevents toolbar collisions */}
      <EditorToolbar
        title="Grayscale Converter"
        badge="B&W"
        onUndo={state.reset}
        onRedo={() => {}}
        onApply={run}
        applyLabel={processing ? "Converting…" : "Apply Grayscale"}
        applyLoading={processing}
      />

      {/* Editor Canvas & Settings Split */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Canvas Area */}
        <div className="relative flex min-h-[260px] max-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-black/90 p-4 sm:p-6 md:max-h-none md:p-8">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, #8e9192 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {!file ? (
            <UploadDropzone
              title="Drag & Drop Image Here"
              description="or tap to browse from your device"
              size="lg"
              onFileSelected={state.selectFile}
              selectedName={state.file?.name ?? null}
              busy={processing}
              className="relative z-10 max-w-xl"
            />
          ) : (
            <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto">
              <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl ?? state.originalUrl ?? ""}
                  alt={resultUrl ? "Grayscale result" : "Original upload"}
                  className={cn(
                    "h-auto max-h-[60vh] w-auto max-w-full rounded-lg object-contain mx-auto transition-all duration-300",
                    !resultUrl && "grayscale"
                  )}
                />
              </div>

              {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
              {processing ? <LoadingIndicator label="Converting image to black & white…" /> : null}
              {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
              {result ? (
                <DownloadButton onClick={state.download} label="Download Grayscale Image" />
              ) : null}
            </div>
          )}
        </div>

        {/* Settings ToolPanel */}
        <ToolPanel
          title="Monochrome Settings"
          description="Convert color photos to timeless black and white tone."
          collapsibleOnMobile={true}
          footer={
            <PanelFooterActions
              onReset={state.reset}
              applyLabel={processing ? "Converting…" : "Apply B&W"}
              onApply={run}
              disabled={!file}
              loading={processing}
              applyIcon={<Download className="size-4" />}
            />
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Conversion Mode
              </span>
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl border border-accent-lavender bg-accent-lavender/10 p-3 ring-1 ring-accent-lavender">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-sm font-semibold text-primary">
                      Neutral Grayscale
                    </span>
                    <span className="rounded bg-accent-lavender/20 px-1.5 py-0.5 font-mono text-[10px] text-accent-lavender">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    Perceptual luminosity weights preserving original tonal depth and contrast.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-container-low p-3 text-xs text-text-secondary">
              <span className="font-semibold text-primary">Pro Tip: </span>
              PNG images preserve transparency after monochrome conversion; JPG images retain high detail with smaller file sizes.
            </div>
          </div>
        </ToolPanel>
      </div>
    </div>
  );
}
