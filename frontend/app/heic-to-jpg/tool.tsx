"use client";

import { useState } from "react";
import { CloudUpload, RefreshCw } from "lucide-react";
import { ToggleSwitch } from "@/components/site/workspace";
import { PanelCta } from "@/components/site/panel-cta";
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
 * HEIC→JPG converter.
 *
 * Wired to POST /api/convert-format with format=jpg + quality — the
 * backend auto-detects HEIC input (sharp/libvips, heic-convert
 * fallback). Batch toggle stays presentational.
 */
function qualityLabel(value: number) {
  if (value > 80) return "High";
  if (value < 40) return "Low";
  return "Medium";
}

export function HeicToJpgTool() {
  const [quality, setQuality] = useState(85);
  const [batch, setBatch] = useState(true);
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
    <div className="relative flex flex-col gap-stack-lg overflow-hidden rounded-xl border border-border bg-surface p-stack-lg shadow-lg">
      {/* Decorative background element */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent-lavender opacity-5 blur-[100px]" />

      {/* Upload Area / Result preview */}
      {file ? (
        <div className="flex flex-col gap-stack-sm">
          <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="JPG" />
          {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
          {processing ? <LoadingIndicator label="Decoding HEIC…" /> : null}
          {error ? <ProcessError message={error} code={errorCode} /> : null}
          {result ? (
            <DownloadButton onClick={state.download} label="Download JPG" className="mx-auto max-w-xs" />
          ) : null}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload HEIC files"
          onClick={() => document.getElementById("heic-upload-input")?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              document.getElementById("heic-upload-input")?.click();
          }}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center transition-colors hover:border-accent-lavender"
        >
          <CloudUpload className="mb-4 text-4xl text-text-secondary transition-colors group-hover:text-accent-lavender" />
          <h3 className="font-headline-md text-headline-md mb-2 text-primary">
            Drag &amp; Drop HEIC files
          </h3>
          <p className="mb-6 font-body-md text-body-md text-text-secondary">
            or click to browse from your device
          </p>
          <input
            id="heic-upload-input"
            type="file"
            accept="image/heic,image/heif,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) state.selectFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Settings Area */}
      <div className="grid grid-cols-1 gap-stack-md border-t border-border pt-stack-md md:grid-cols-2">
        {/* Quality Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="heic-quality" className="font-label-md text-label-md text-primary">
              Quality
            </label>
            <span className="font-label-sm text-label-sm text-text-secondary">
              {qualityLabel(quality)} ({quality}%)
            </span>
          </div>
          <input
            id="heic-quality"
            type="range"
            min={1}
            max={100}
            value={quality}
            aria-label="Output quality"
            onChange={(e) => setQuality(Number(e.target.value))}
            className="slider-thumb w-full"
          />
        </div>

        {/* Batch Toggle */}
        <div className="flex flex-col justify-center">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <span className="block font-label-md text-label-md text-primary">
                Batch Processing
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary">
                Convert multiple files at once (one at a time for now)
              </span>
            </div>
            <ToggleSwitch
              defaultChecked={batch}
              label="Batch processing"
              scale="md"
              onChange={() => setBatch((v) => !v)}
            />
          </label>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-end pt-stack-md">
        <PanelCta
          label={processing ? "Converting…" : "Convert to JPG"}
          icon={<RefreshCw className="size-4" />}
          variant="accent"
          disabled={!file || processing}
          hint={file ? undefined : "Select a HEIC file first"}
          onClick={run}
        />
      </div>
    </div>
  );
}
