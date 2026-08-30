"use client";

import { useState } from "react";
import { CloudUpload, RefreshCw, Settings2 } from "lucide-react";
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
 * WebP→JPG converter.
 *
 * Wired to POST /api/convert-format with format=jpg + quality.
 */
export function WebpToJpgTool() {
  const [quality, setQuality] = useState(85);
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
    <div className="relative flex flex-col gap-stack-lg">
      <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-container p-stack-lg shadow-lg">
        {/* Drop Zone / Result */}
        {file ? (
          <div className="flex flex-col gap-stack-sm">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="JPG" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload WebP files"
            onClick={() => document.getElementById("webp-upload-input")?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                document.getElementById("webp-upload-input")?.click();
            }}
            className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface/50 p-stack-lg text-center transition-colors group-hover:bg-surface-container-high/50 hover:border-accent-lavender"
          >
            <CloudUpload className="mb-4 text-6xl text-text-secondary transition-colors group-hover:text-accent-lavender" />
            <h3 className="mb-2 font-headline-md text-headline-md text-primary">
              Drag &amp; Drop files here
            </h3>
            <p className="mb-6 font-body-md text-text-secondary">
              or click to browse from your computer
            </p>
            <input
              id="webp-upload-input"
              type="file"
              accept="image/webp,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) state.selectFile(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <p className="mt-4 font-label-sm text-label-sm text-text-secondary">
              Supports .webp up to 15MB
            </p>
          </div>
        )}

        {/* Settings Panel */}
        <div className="mt-stack-lg border-t border-border pt-stack-md">
          <h4 className="mb-4 flex items-center gap-2 font-label-md text-label-md text-primary">
            <Settings2 className="text-sm" />
            Conversion Settings
          </h4>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="webp-quality" className="font-label-sm text-label-sm text-text-secondary">
                  Image Quality
                </label>
                <span className="font-label-sm text-label-sm text-primary">{quality}%</span>
              </div>
              <input
                id="webp-quality"
                type="range"
                min={1}
                max={100}
                value={quality}
                aria-label="Image quality"
                onChange={(e) => setQuality(Number(e.target.value))}
                className="slider-thumb w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status + Action Area */}
      {processing ? <LoadingIndicator label="Converting…" /> : null}
      {error ? <ProcessError message={error} code={errorCode} /> : null}
      <div className="flex flex-col gap-stack-sm">
        <PanelCta
          label={processing ? "Converting…" : "Convert to JPG"}
          icon={<RefreshCw className="size-4" />}
          variant="accent"
          disabled={!file || processing}
          hint={file ? undefined : "Select a WebP image first"}
          onClick={run}
        />
        {result ? (
          <DownloadButton onClick={state.download} label="Download JPG" />
        ) : null}
      </div>
    </div>
  );
}
