"use client";

import { useState } from "react";
import { Square } from "lucide-react";
import { PanelCta } from "@/components/site/panel-cta";
import {
  BeforeAfter,
  DownloadButton,
  LoadingIndicator,
  ProcessError,
  ResultMeta,
} from "@/components/site/process-result";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { useProcessing } from "@/lib/use-processing";
import { DEFAULT_TIMEOUTS } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Square Cropper tool.
 *
 * Wired to POST /api/crop with shape=square — the backend returns a
 * centered maximum square. UI extras (padding/zoom/fill) stay
 * presentational only until the backend grows matching params.
 */
export function SquareCropperTool() {
  const [fill, setFill] = useState("Black");
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("shape", "square");
    await state.run("/api/crop", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
      {/* Canvas Area */}
      <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface-container-low p-4 sm:p-6 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="We'll crop the largest centered square"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            className="w-full"
          />
        ) : (
          <div className="flex w-full flex-col gap-3">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Square" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
          </div>
        )}
        {processing ? <LoadingIndicator label="Cropping image to square…" /> : null}
        {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
        {result ? (
          <DownloadButton onClick={state.download} label="Download Square Image" className="max-w-md" />
        ) : null}
      </div>

      {/* Properties Panel (Right Side) */}
      <div className="flex h-fit flex-col gap-stack-lg rounded-xl border border-border bg-surface p-stack-md lg:col-span-4 lg:sticky lg:top-24">
        <div className="border-b border-border pb-stack-sm">
          <h3 className="font-headline-md text-headline-md font-semibold text-primary">
            Square Cropper
          </h3>
          <p className="mt-1 font-body-sm text-sm text-text-secondary">
            Make images perfectly square for social media.
          </p>
        </div>

        {/* Size Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-primary">Output</label>
            <span className="rounded-md bg-surface-container-high px-2 py-1 font-label-sm text-label-sm text-text-secondary">
              Centered max square
            </span>
          </div>
          <p className="font-label-sm text-label-sm text-outline">
            The crop is taken from the center of your image at its largest
            possible square size.
          </p>
        </div>

        {/* Background Fill (presentational) */}
        <div className="space-y-4">
          <label className="block font-label-md text-label-md text-primary">
            Background Fill (preview only)
          </label>
          <div className="flex gap-2">
            {["Black", "White"].map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                onClick={() => setFill(name)}
                className={cn(
                  "aspect-square w-10 rounded-full border transition-colors",
                  name === "Black" ? "bg-black" : "bg-white",
                  fill === name ? "border-2 border-accent-lavender" : "border-outline-variant"
                )}
              />
            ))}
          </div>
        </div>

        {/* Primary Action */}
        <PanelCta
          label={processing ? "Cropping…" : "Apply Crop"}
          icon={<Square className="size-4" />}
          variant="accent"
          disabled={!file || processing}
          onClick={run}
        />
        <button
          type="button"
          onClick={state.reset}
          className="rounded-full border border-outline-variant px-6 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
