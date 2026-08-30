"use client";

import { useState } from "react";
import { CloudUpload, Play } from "lucide-react";
import { ToggleSwitch } from "@/components/site/workspace";
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
 * JPEG→JPG converter.
 *
 * Wired to POST /api/convert-format with format=jpg and the quality
 * slider value. Batch/metadata toggles stay presentational (the
 * backend converts one file per request).
 */
export function JpegToJpgTool() {
  const [quality, setQuality] = useState(90);
  const [stripMetadata, setStripMetadata] = useState(true);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("format", "jpg");
    fd.append("quality", String(quality));
    await state.run("/api/convert-format", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="grid grid-cols-1 gap-stack-md md:grid-cols-3">
      {/* Upload Area / Preview */}
      <div className="relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-dashed border-border bg-[#09090B] p-stack-lg transition-colors hover:border-accent-lavender/50 md:col-span-2">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-container-lowest to-surface-container opacity-50" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-stack-sm text-center">
          {file ? (
            <div className="flex w-full flex-col gap-stack-sm">
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="JPG" />
              {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
              {processing ? <LoadingIndicator label="Converting…" /> : null}
              {error ? <ProcessError message={error} code={errorCode} /> : null}
              {result ? (
                <DownloadButton onClick={state.download} label="Download JPG" className="mx-auto max-w-xs" />
              ) : null}
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload JPEG files"
              onClick={() => document.getElementById("jpeg-upload-input")?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  document.getElementById("jpeg-upload-input")?.click();
              }}
              className="flex cursor-pointer flex-col items-center gap-stack-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high transition-transform duration-300 group-hover:scale-110">
                <CloudUpload className="text-3xl text-primary" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-primary">Drag &amp; drop files here</p>
                <p className="mt-1 font-label-sm text-label-sm text-text-secondary">
                  or click to browse (.jpeg files)
                </p>
              </div>
              <input
                id="jpeg-upload-input"
                type="file"
                accept="image/jpeg,.jpeg,.jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) state.selectFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div className="flex flex-col gap-stack-md rounded-xl border border-border bg-[#09090B] p-stack-md">
        <h3 className="border-b border-border pb-2 font-headline-md text-headline-md text-primary">
          Settings
        </h3>

        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="jpeg-quality" className="font-label-md text-label-md text-on-surface">Output Quality</label>
            <span className="rounded-md bg-accent-lavender/10 px-2 py-0.5 font-label-sm text-label-sm text-accent-lavender">
              {quality}%
            </span>
          </div>
          <input
            id="jpeg-quality"
            type="range"
            min={1}
            max={100}
            value={quality}
            aria-label="Output quality"
            onChange={(e) => setQuality(Number(e.target.value))}
            className="slider-thumb w-full"
          />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Smaller File</span>
            <span>Best Quality</span>
          </div>
        </div>

        {/* Metadata Toggle */}
        <div className="space-y-3 pt-stack-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="block font-label-md text-label-md text-on-surface">
                Strip Metadata
              </label>
              <span className="font-label-sm text-label-sm text-text-secondary">
                Remove EXIF data for privacy
              </span>
            </div>
            <ToggleSwitch
              defaultChecked={stripMetadata}
              label="Strip metadata"
              scale="md"
              onChange={() => setStripMetadata((v) => !v)}
            />
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto border-t border-border pt-stack-md">
          <button
            type="button"
            disabled={!file || processing}
            onClick={run}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-container-high py-3 font-label-md text-label-md transition-colors hover:border-outline hover:text-primary disabled:cursor-not-allowed disabled:text-text-secondary disabled:opacity-50"
          >
            <Play className="text-[18px]" />
            {processing ? "Converting…" : "Start Conversion"}
          </button>
        </div>
      </div>
    </div>
  );
}
