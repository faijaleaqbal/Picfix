"use client";

import { useState } from "react";
import { ArrowRight, Link2 } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { PanelCta } from "@/components/site/panel-cta";
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
import { cn } from "@/lib/utils";

/**
 * Resize tool (shared by /resize-image-pixel and /resize-image-in-cm).
 *
 * Wired to POST /api/resize — sends width (required), height (optional),
 * unit (px|cm), dpi (72-1200, default 300 — used for cm/mm/inch → px),
 * maintainAspectRatio ("false" to stretch) and fit (cover default).
 */
export function ResizeImageTool({ defaultUnit = "px" }: { defaultUnit?: "px" | "cm" }) {
  const [unit, setUnit] = useState<"px" | "cm">(defaultUnit);
  const [width, setWidth] = useState(unit === "px" ? 1920 : 50);
  const [height, setHeight] = useState(unit === "px" ? 1080 : 30);
  const [lockAspect, setLockAspect] = useState(true);
  const [dpi, setDpi] = useState(300);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const toggleUnit = (next: "px" | "cm") => {
    if (next === unit) return;
    if (next === "cm") {
      setWidth(Number((width / 38).toFixed(1)));
      setHeight(Number((height / 38).toFixed(1)));
    } else {
      setWidth(Math.round(width * 38));
      setHeight(Math.round(height * 38));
    }
    setUnit(next);
  };

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("width", String(width));
    if (height) fd.append("height", String(height));
    fd.append("unit", unit);
    if (unit === "cm") fd.append("dpi", String(dpi));
    fd.append("maintainAspectRatio", lockAspect ? "true" : "false");
    fd.append("fit", lockAspect ? "inside" : "fill");
    await state.run("/api/resize", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="mb-stack-lg grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
      {/* Upload & Preview Canvas */}
      <div className="flex flex-col gap-stack-lg lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop your image here"
            description="or click to browse from your device"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="flex flex-col gap-stack-sm rounded-xl border border-border bg-surface p-stack-md">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Resized" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {result?.dpi ? (
              <p className="font-label-sm text-label-sm text-text-secondary">
                Output DPI: {result.dpi}
              </p>
            ) : null}
          </div>
        )}
        {processing ? <LoadingIndicator label="Resizing…" /> : null}
        {error ? <ProcessError message={error} code={errorCode} /> : null}
        {result ? <DownloadButton onClick={state.download} label="Download Resized Image" /> : null}
      </div>

      {/* Settings Panel */}
      <div className="sticky top-24 flex h-fit flex-col gap-stack-md rounded-xl border border-border bg-surface p-stack-md md:p-stack-lg lg:col-span-4">
        <div className="mb-stack-sm flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-primary">
            Dimensions
          </h2>
          <div className="flex gap-1 rounded-md bg-surface-container-high p-1">
            <button
              type="button"
              onClick={() => toggleUnit("px")}
              className={cn(
                "rounded px-2 py-1 font-label-sm text-label-sm transition-colors",
                unit === "px"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-text-secondary hover:text-primary"
              )}
            >
              px
            </button>
            <button
              type="button"
              onClick={() => toggleUnit("cm")}
              className={cn(
                "rounded px-2 py-1 font-label-sm text-label-sm transition-colors",
                unit === "cm"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-text-secondary hover:text-primary"
              )}
            >
              cm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-stack-md">
          <div>
            <label className="mb-base block font-label-sm text-label-sm text-text-secondary">
              Width
            </label>
            <div className="relative">
              <input
                type="number"
                value={width}
                min={1}
                aria-label="Width"
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-surface-container-low px-3 py-2 font-body-md text-body-md text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-lavender"
              />
              <span className="absolute right-3 top-2 font-label-sm text-text-secondary">
                W
              </span>
            </div>
          </div>
          <div>
            <label className="mb-base block font-label-sm text-label-sm text-text-secondary">
              Height
            </label>
            <div className="relative">
              <input
                type="number"
                value={height}
                min={1}
                aria-label="Height"
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-surface-container-low px-3 py-2 font-body-md text-body-md text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-lavender"
              />
              <span className="absolute right-3 top-2 font-label-sm text-text-secondary">
                H
              </span>
            </div>
          </div>
        </div>

        <div className="mt-stack-sm flex items-center justify-between rounded-md border border-border bg-surface-container-low p-stack-sm">
          <div className="flex items-center gap-2">
            <Link2 className="text-sm text-text-secondary" />
            <span className="font-label-md text-label-md text-primary">
              Maintain Aspect Ratio
            </span>
          </div>
          <ToggleSwitch
            defaultChecked={lockAspect}
            label="Maintain aspect ratio"
            onChange={() => setLockAspect((v) => !v)}
          />
        </div>

        {/* DPI (used by the backend when unit != px) */}
        <div className="mt-stack-md">
          <label htmlFor="resize-dpi" className="mb-base block font-label-sm text-label-sm text-text-secondary">
            DPI {unit === "cm" ? "(used for cm → px)" : "(recorded in output)"}
          </label>
          <input
            id="resize-dpi"
            type="number"
            min={72}
            max={1200}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-surface-container-low px-3 py-2 font-body-md text-body-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-lavender"
          />
        </div>

        <div className="mt-stack-lg flex flex-col gap-stack-sm border-t border-border pt-stack-md">
          <PanelCta
            label={processing ? "Resizing…" : "Resize Image"}
            icon={<ArrowRight className="size-4" />}
            hint={file ? "Your image will be resized at this exact size." : "Select an image first."}
            disabled={!file || processing}
            onClick={run}
          />
        </div>
      </div>
    </div>
  );
}
