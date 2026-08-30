"use client";

import { useState } from "react";
import { Download, Undo2, Redo2, ZoomIn, ZoomOut } from "lucide-react";
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
  const [zoom, setZoom] = useState(100);
  const state = useProcessing();
  const { file, result, resultUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    await state.run("/api/grayscale", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header area for tool context */}
      <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface/80 px-gutter backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Grayscale Image
            </h2>
            <p className="font-label-sm text-label-sm text-text-secondary">
              Convert photos to striking black and white.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Undo"
            onClick={state.reset}
            className="flex items-center gap-2 font-label-md text-label-md text-text-secondary transition-colors hover:text-primary"
          >
            <Undo2 className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            className="flex items-center gap-2 font-label-md text-label-md text-text-secondary transition-colors hover:text-primary"
          >
            <Redo2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!file || processing}
            className="rounded-full bg-primary px-6 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-tertiary-fixed disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Working…" : "Apply"}
          </button>
        </div>
      </header>

      {/* Editor Canvas & Settings Split */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Canvas Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-y-auto bg-surface-container-lowest p-stack-lg">
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
              description="or click to browse from your device"
              size="lg"
              onFileSelected={state.selectFile}
              selectedName={state.file?.name ?? null}
              busy={processing}
              className="relative z-10 max-w-xl"
            />
          ) : (
            <div className="group relative flex flex-col gap-stack-sm">
              {/* Before / after */}
              <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl ?? state.originalUrl ?? ""}
                  alt={resultUrl ? "Grayscale result" : "Original upload"}
                  className={cn(
                    "h-auto max-h-[716px] w-auto transition-all duration-300",
                    !resultUrl && "grayscale"
                  )}
                />
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface/90 px-4 py-2 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() => setZoom((z) => Math.max(25, z - 25))}
                    className="p-1 text-text-secondary hover:text-primary"
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="w-12 text-center font-label-sm text-label-sm text-primary">
                    {zoom === 100 ? "Fit" : `${zoom}%`}
                  </span>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() => setZoom((z) => Math.min(400, z + 25))}
                    className="p-1 text-text-secondary hover:text-primary"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                </div>
              </div>
              {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
              {processing ? <LoadingIndicator label="Converting to black & white…" /> : null}
              {error ? <ProcessError message={error} code={errorCode} /> : null}
              {result ? (
                <DownloadButton onClick={state.download} label="Download Grayscale Image" />
              ) : null}
            </div>
          )}
        </div>

        {/* Settings Panel (Right) */}
        <aside className="z-10 flex h-full w-full shrink-0 flex-col overflow-y-auto border-l border-outline-variant bg-surface lg:w-80">
          <div className="flex flex-col gap-stack-lg p-gutter">
            {/* Presets Section */}
            <section>
              <h3 className="mb-stack-sm font-label-md text-label-md text-primary">
                Presets
              </h3>
              <p className="font-label-sm text-label-sm text-text-secondary">
                All presets apply the same high-quality grayscale conversion.
              </p>
            </section>

            {/* Primary action for mobile / alternative */}
            <section className="mt-auto flex flex-col gap-stack-sm">
              <DownloadButton
                onClick={state.download}
                label="Download Result"
                disabled={!result}
                icon={<Download className="size-4" />}
              />
              <button
                type="button"
                onClick={state.reset}
                className="rounded-full border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
              >
                Reset
              </button>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
