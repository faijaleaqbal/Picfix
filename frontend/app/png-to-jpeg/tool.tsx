"use client";

import { useState } from "react";
import { SlidersHorizontal, Zap } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { ColorSwatches } from "@/components/site/workspace";
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
 * PNG→JPEG converter.
 *
 * Wired to POST /api/convert-format with format=jpeg + quality.
 * Background-fill swatches remain presentational — the backend
 * flattens transparency to black by default when JPEG-ing.
 */
const FILLS = [
  { name: "White", className: "bg-white" },
  { name: "Black", className: "bg-black" },
];

export function PngToJpegTool() {
  const [fill, setFill] = useState("White");
  const [quality, setQuality] = useState(85);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("format", "jpeg");
    fd.append("quality", String(quality));
    await state.run("/api/convert-format", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="grid flex-grow grid-cols-1 gap-stack-lg lg:grid-cols-12">
      {/* Main Dropzone/Preview Area */}
      <div className="flex h-full flex-col gap-stack-md lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Upload PNG Image"
            description="Drag and drop or click to browse"
            buttonLabel="Select File"
            hint="PNG with transparency supported"
            accept="image/png,.png"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="flex min-h-[400px] flex-grow flex-col gap-stack-sm rounded-xl border border-border bg-surface-container p-stack-md">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="JPEG" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Converting…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download JPEG" className="mx-auto max-w-xs" />
            ) : null}
          </div>
        )}
      </div>

      {/* Settings Sidebar */}
      <div className="flex h-fit flex-col gap-stack-md lg:col-span-4">
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-stack-md">
          <h3 className="mb-stack-md flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
            <SlidersHorizontal className="text-accent-lavender" />
            Conversion Settings
          </h3>

          {/* Background Fill */}
          <div className="mb-stack-lg">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-label-md text-label-md text-primary">Background Fill</label>
              <span className="font-normal text-text-secondary">
                {fill === "White" ? "#FFFFFF" : "#000000"}
              </span>
            </div>
            <p className="mb-3 font-label-sm text-label-sm text-text-secondary">
              Transparency is flattened during JPEG conversion.
            </p>
            <div className="mb-3 flex gap-2">
              <ColorSwatches colors={FILLS} value={fill} onChange={setFill} />
            </div>
          </div>

          {/* Quality Setting */}
          <div className="mb-stack-lg">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="png-quality" className="font-label-md text-label-md text-primary">JPEG Quality</label>
              <span className="font-bold text-accent-lavender">{quality}%</span>
            </div>
            <input
              id="png-quality"
              type="range"
              min={1}
              max={100}
              value={quality}
              aria-label="JPEG quality"
              onChange={(e) => setQuality(Number(e.target.value))}
              className="slider-thumb w-full"
            />
            <div className="mt-2 flex justify-between font-label-sm text-label-sm text-text-secondary">
              <span>Small File</span>
              <span>High Quality</span>
            </div>
          </div>

          {/* Action Button */}
          <PanelCta
            label={processing ? "Converting…" : "Convert Image"}
            icon={<Zap className="size-4" />}
            disabled={!file || processing}
            hint={file ? undefined : "Select a file to enable conversion"}
            onClick={run}
          />
        </div>
      </div>
    </div>
  );
}
