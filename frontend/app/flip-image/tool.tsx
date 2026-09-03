"use client";

import { useState } from "react";
import { FlipHorizontal, FlipVertical } from "lucide-react";
import { PanelFooterActions, ToolPanel } from "@/components/site/tool-panel";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import {
  BeforeAfter,
  DownloadButton,
  LoadingIndicator,
  ProcessError,
  ResultMeta,
} from "@/components/site/process-result";
import { useProcessing } from "@/lib/use-processing";
import { DEFAULT_TIMEOUTS } from "@/lib/api";

/**
 * Flip workbench.
 *
 * Wired to POST /api/flip — direction: horizontal|vertical (pick
 * which transform to send; both toggles stay for the visual preview).
 */
export function FlipTool() {
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const canRun = file && (flipH || flipV);

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("direction", flipH ? "horizontal" : "vertical");
    await state.run("/api/flip", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Canvas Area */}
      <div className="relative flex min-h-[300px] max-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-[#f4f5fa] border-b border-border/60 p-4 sm:p-6 md:max-h-none md:border-b-0 md:border-r md:p-8">
        {/* Light studio canvas grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c7cbe0 1px, transparent 0)",
            backgroundSize: "20px 20px",
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
            className="relative z-10 max-w-xl shadow-sm"
          />
        ) : (
          <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto">
            <div className="overflow-hidden rounded-xl border border-[#d9dcea] bg-white p-2 shadow-sm">
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Flipped" />
            </div>
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Flipping image…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Flipped Image" />
            ) : null}
          </div>
        )}
      </div>


      {/* Tool Panel */}
      <ToolPanel
        title="Flip Settings"
        description="Mirror images horizontally or vertically."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={() => {
              setFlipH(false);
              setFlipV(false);
              state.reset();
            }}
            applyLabel={processing ? "Flipping…" : "Apply Flip"}
            onApply={run}
            disabled={!canRun}
            loading={processing}
            applyIcon={<FlipHorizontal className="size-4" />}
          />
        }
      >
        <div className="space-y-3">
          <h4 className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Direction
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setFlipH((v) => !v);
                setFlipV(false);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 min-h-[64px] transition-all active:scale-95 ${
                flipH
                  ? "border-accent-lavender bg-accent-lavender/15 text-accent-lavender font-semibold ring-1 ring-accent-lavender"
                  : "border-border bg-surface-container hover:border-accent-lavender hover:bg-surface-container-high text-text-secondary hover:text-primary"
              }`}
            >
              <FlipHorizontal className="size-6" />
              <span className="text-xs sm:text-sm">Horizontal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFlipV((v) => !v);
                setFlipH(false);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 min-h-[64px] transition-all active:scale-95 ${
                flipV
                  ? "border-accent-lavender bg-accent-lavender/15 text-accent-lavender font-semibold ring-1 ring-accent-lavender"
                  : "border-border bg-surface-container hover:border-accent-lavender hover:bg-surface-container-high text-text-secondary hover:text-primary"
              }`}
            >
              <FlipVertical className="size-6" />
              <span className="text-xs sm:text-sm">Vertical</span>
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            {canRun
              ? `Selected: mirror ${flipH ? "horizontally (left-right)" : "vertically (top-down)"}.`
              : "Select a flip axis above, then tap Apply."}
          </p>
        </div>
      </ToolPanel>
    </div>
  );
}
