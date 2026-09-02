"use client";

import { useState } from "react";
import { CircleDot } from "lucide-react";
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

/**
 * Circle Crop tool.
 *
 * Wired to POST /api/crop with shape=circle — the backend returns a
 * PNG with a transparent background around the centered max circle.
 * Radius/feather/border settings remain presentational (not part of
 * the backend contract yet).
 */
export function CircleCropTool() {
  const [transparent, setTransparent] = useState(true);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("shape", "circle");
    await state.run("/api/crop", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
      {/* Canvas Area */}
      <div className="flex min-h-[260px] sm:min-h-[360px] md:min-h-[440px] flex-col overflow-hidden rounded-2xl border border-border bg-surface lg:col-span-8">
        {/* Toolbar top */}
        <div className="z-10 flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface-container-low px-4">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Circle Crop Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={state.reset}
              className="rounded-lg px-3 py-1.5 font-label-sm text-xs font-medium text-text-secondary transition-colors hover:bg-surface-variant hover:text-primary"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={run}
              disabled={!file || processing}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-label-sm text-xs font-semibold text-on-primary shadow-sm transition-transform hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Cropping…" : "Apply"}
            </button>
          </div>
        </div>

        {/* Canvas (checkerboard for transparency) */}
        <div className="checkerboard-bg relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">
          {!file ? (
            <UploadDropzone
              title="Drag & Drop Image Here"
              description="We'll crop the largest centered circle"
              buttonLabel="Select Image"
              onFileSelected={state.selectFile}
              selectedName={state.file?.name ?? null}
              className="w-full"
            />
          ) : (
            <div className="flex w-full flex-col gap-3">
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Circle (PNG)" />
              {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            </div>
          )}
        </div>
        {processing ? <LoadingIndicator label="Cropping image into circle…" className="m-4" /> : null}
        {error ? <ProcessError message={error} code={errorCode} onRetry={run} className="m-4" /> : null}
        {result ? (
          <div className="p-4">
            <DownloadButton onClick={state.download} label="Download Circle PNG" />
          </div>
        ) : null}
      </div>

      {/* Settings Panel (Right side) */}
      <div className="flex h-fit flex-col gap-stack-lg rounded-xl border border-border bg-surface p-stack-md lg:col-span-4 lg:sticky lg:top-24">
        <div className="border-b border-border pb-stack-sm">
          <h3 className="font-headline-md text-headline-md font-semibold text-primary">
            Circle Crop
          </h3>
          <p className="mt-1 font-body-md text-sm text-text-secondary">
            Crop images into perfect circles.
          </p>
        </div>

        {/* Background Settings */}
        <div className="space-y-4">
          <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
            Background
          </h4>
          <label className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-container-low/50 p-3 transition-colors hover:bg-surface-container-low">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              className="rounded border-border bg-surface text-accent-lavender focus:ring-accent-lavender focus:ring-offset-surface"
            />
            <div className="flex-1">
              <span className="block font-label-md text-label-md text-primary">
                Transparent Background
              </span>
              <span className="mt-0.5 block text-label-sm text-text-secondary">
                Circle output is always PNG with transparency
              </span>
            </div>
          </label>
        </div>

        <p className="font-label-sm text-label-sm text-outline">
          The backend crops the largest centered circle from your image and
          exports a transparent PNG.
        </p>

        {/* Primary Action */}
        <PanelCta
          label={processing ? "Cropping…" : "Apply Crop"}
          icon={<CircleDot className="size-4" />}
          disabled={!file || processing}
          onClick={run}
        />
      </div>
    </div>
  );
}
