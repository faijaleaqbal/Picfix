"use client";

import { useState } from "react";
import { Check, Crop, Frame, Proportions, Ratio, Scan } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { PanelHeader } from "@/components/site/sections";
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
import { cn } from "@/lib/utils";

/**
 * Crop settings panel (right column of /crop-image).
 *
 * Wired to POST /api/crop — x/y/width/height crop rectangle (px).
 * Aspect presets snap the rectangle to a centered W:H ratio sized to
 * the image (the image dimensions come from the file once selected).
 */
const ASPECTS = [
  { label: "1:1", icon: Ratio, ratio: 1 },
  { label: "4:3", icon: Frame, ratio: 4 / 3 },
  { label: "16:9", icon: Scan, ratio: 16 / 9 },
];

export function CropImageTool() {
  const [aspect, setAspect] = useState<string>("Custom");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  /** Load the image's real dimensions once selected, to clamp the crop rect. */
  const handleFile = (f: File) => {
    state.selectFile(f);
    const url = URL.createObjectURL(f);
    const img = new window.Image();
    img.onload = () => {
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const applyAspect = (label: string, ratio: number) => {
    setAspect(label);
    if (!dims) return;
    const centered = (w: number, h: number) => {
      setWidth(w);
      setHeight(h);
      setX(Math.floor((dims.w - w) / 2));
      setY(Math.floor((dims.h - h) / 2));
    };
    if (ratio >= 1) {
      const w = Math.min(dims.w, Math.round(dims.h * ratio));
      centered(w, Math.round(w / ratio));
    } else {
      const h = Math.min(dims.h, Math.round(dims.w / ratio));
      centered(Math.round(h * ratio), h);
    }
  };

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("x", String(Math.round(x)));
    fd.append("y", String(Math.round(y)));
    fd.append("width", String(Math.round(width)));
    fd.append("height", String(Math.round(height)));
    await state.run("/api/crop", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  const reset = () => {
    setAspect("Custom");
    setX(0);
    setY(0);
    setWidth(800);
    setHeight(600);
    state.reset();
  };

  return (
    <div className="grid grid-cols-1 gap-stack-md lg:grid-cols-12">
      {/* Left: upload & preview */}
      <div className="flex flex-col gap-stack-md lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="or click to browse (JPG, PNG, WebP)"
            size="lg"
            onFileSelected={handleFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-stack-md">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Cropped" />
            {result ? <ResultMeta result={result} originalSize={file.size} className="mt-stack-sm" /> : null}
          </div>
        )}
        {processing ? <LoadingIndicator label="Cropping…" /> : null}
        {error ? <ProcessError message={error} code={errorCode} /> : null}
        {result ? <DownloadButton onClick={state.download} label="Download Cropped Image" /> : null}
      </div>

      {/* Settings panel */}
      <div className="sticky top-24 flex h-fit flex-col gap-stack-md rounded-xl border border-border bg-surface-container-low p-stack-lg lg:col-span-4">
        <div>
          <PanelHeader title="Settings" icon={<Crop className="size-5" />} />

          {/* Aspect Ratio Presets */}
          <div className="mb-stack-lg mt-stack-md">
            <label className="mb-stack-sm block font-label-md text-label-md text-text-secondary">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspect("Custom")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-md border px-3 py-2 font-label-sm text-label-sm transition-colors",
                  aspect === "Custom"
                    ? "border-accent-lavender bg-surface text-primary"
                    : "border-border bg-surface text-text-secondary hover:border-outline-variant hover:bg-muted"
                )}
              >
                <Proportions className={cn("text-lg", aspect === "Custom" ? "text-accent-lavender" : "text-text-secondary")} />
                Custom
              </button>
              {ASPECTS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyAspect(preset.label, preset.ratio)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-md border px-3 py-2 font-label-sm text-label-sm transition-colors",
                    aspect === preset.label
                      ? "border-accent-lavender bg-surface text-primary"
                      : "border-border bg-surface text-text-secondary hover:border-outline-variant hover:bg-muted"
                  )}
                >
                  <preset.icon
                    className={cn("text-lg", aspect === preset.label ? "text-accent-lavender" : "text-text-secondary")}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
            {dims ? (
              <p className="mt-2 font-label-sm text-label-sm text-outline">
                Image size: {dims.w} × {dims.h}px
              </p>
            ) : null}
          </div>

          {/* Manual Coordinates */}
          <div>
            <label className="mb-stack-sm block font-label-md text-label-md text-text-secondary">
              Manual Adjustment (px)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Width (W)", value: width, set: setWidth, aria: "Crop width" },
                { label: "Height (H)", value: height, set: setHeight, aria: "Crop height" },
                { label: "X Offset", value: x, set: setX, aria: "X offset" },
                { label: "Y Offset", value: y, set: setY, aria: "Y offset" },
              ].map(({ label, value, set, aria }) => (
                <div key={label}>
                  <label className="mb-1 block font-label-sm text-label-sm text-text-secondary">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    aria-label={aria}
                    onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body-sm text-primary focus:border-accent-lavender focus:outline-none focus:ring-1 focus:ring-accent-lavender"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto border-t border-border pt-stack-md">
          <PanelCta
            label="Crop & Save"
            icon={<Check className="size-4" />}
            disabled={!file || processing}
            onClick={run}
          />
          <button
            type="button"
            onClick={reset}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent py-3 font-label-md text-label-md text-text-secondary transition-colors hover:bg-muted hover:text-primary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
