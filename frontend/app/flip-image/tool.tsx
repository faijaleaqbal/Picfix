"use client";

import { useState } from "react";
import { FlipHorizontal, FlipVertical, Download } from "lucide-react";
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
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Canvas Area */}
      <div className="pattern-grid relative flex flex-1 flex-col items-center justify-center gap-stack-md overflow-y-auto p-gutter">
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
          <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col gap-stack-sm overflow-y-auto">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Flipped" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Flipping…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Flipped Image" />
            ) : null}
          </div>
        )}
      </div>

      {/* Tool Panel */}
      <ToolPanel
        title="Flip Image"
        description="Mirror images horizontally or vertically."
        footer={
          <PanelFooterActions
            onReset={() => {
              setFlipH(false);
              setFlipV(false);
              state.reset();
            }}
            applyLabel={processing ? "Working…" : "Apply"}
            onApply={run}
            applyIcon={<Download className="size-4" />}
          />
        }
      >
        <div className="space-y-stack-sm">
          <h3 className="font-label-md text-xs uppercase tracking-wider text-on-surface">
            Transform
          </h3>
          <div className="grid grid-cols-2 gap-stack-sm">
            <button
              type="button"
              onClick={() => setFlipH((v) => !v)}
              className={`group flex flex-col items-center justify-center gap-stack-sm rounded-xl border p-4 transition-all ${
                flipH
                  ? "border-accent-lavender bg-surface-container-high"
                  : "border-border bg-surface-container hover:border-accent-lavender hover:bg-surface-container-high"
              }`}
            >
              <FlipHorizontal className="text-2xl text-text-secondary transition-colors group-hover:text-primary" />
              <span className="font-label-sm text-label-sm text-text-secondary transition-colors group-hover:text-primary">
                Horizontal
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFlipV((v) => !v)}
              className={`group flex flex-col items-center justify-center gap-stack-sm rounded-xl border p-4 transition-all ${
                flipV
                  ? "border-accent-lavender bg-surface-container-high"
                  : "border-border bg-surface-container hover:border-accent-lavender hover:bg-surface-container-high"
              }`}
            >
              <FlipVertical className="text-2xl text-text-secondary transition-colors group-hover:text-primary" />
              <span className="font-label-sm text-label-sm text-text-secondary transition-colors group-hover:text-primary">
                Vertical
              </span>
            </button>
          </div>
          <p className="font-label-sm text-label-sm text-outline">
            {canRun
              ? `Will mirror ${flipH ? "horizontally" : "vertically"}${flipH && flipV ? " (horizontal is sent)" : ""}.`
              : "Pick at least one transform."}
          </p>
        </div>
      </ToolPanel>
    </div>
  );
}
