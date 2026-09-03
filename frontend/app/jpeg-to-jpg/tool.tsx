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
      <div className="relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-dashed border-[#9da0d9] bg-white p-stack-lg transition-colors hover:border-[#4449A6] md:col-span-2 shadow-sm">
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
              className="flex cursor-pointer flex-col items-center gap-stack-sm py-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eff0fa] text-[#4956a5] transition-transform duration-300 group-hover:scale-110">
                <CloudUpload className="size-8" />
              </div>
              <div>
                <p className="font-bold text-base text-gray-800">Drag &amp; drop JPEG files here</p>
                <p className="mt-1 text-xs text-gray-500">
                  or click to browse from your device
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
      <div className="flex flex-col gap-stack-md rounded-xl border border-[#d9dcea] bg-white p-5 shadow-sm">
        <h3 className="border-b border-gray-200 pb-2 text-base font-bold text-gray-800">
          Settings
        </h3>

        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="jpeg-quality" className="text-xs font-bold uppercase tracking-wider text-gray-600">Output Quality</label>
            <span className="rounded-md bg-[#eff0fa] px-2 py-0.5 text-xs font-bold text-[#4956a5]">
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
          <div className="flex justify-between text-xs text-gray-500">
            <span>Smaller File</span>
            <span>Best Quality</span>
          </div>
        </div>

        {/* Metadata Toggle */}
        <div className="space-y-3 pt-stack-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Strip Metadata
              </label>
              <span className="text-xs text-gray-500">
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
        <div className="mt-auto border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={!file || processing}
            onClick={run}
            className="flex w-full items-center justify-center gap-2 rounded bg-[#047e73] py-2.5 text-sm font-bold text-white shadow hover:bg-[#036960] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="size-4 fill-current" />
            {processing ? "Converting…" : "Convert to JPG"}
          </button>
        </div>
      </div>
    </div>

  );
}
