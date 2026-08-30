"use client";

import { useState } from "react";
import { RotateCcw, RotateCw, RefreshCw, Download } from "lucide-react";
import { CanvasToolbar } from "@/components/site/workspace";
import { PanelFooterActions, ToolPanel } from "@/components/site/tool-panel";
import { UploadDropzone } from "@/components/site/upload-dropzone";
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
 * Rotate workbench.
 *
 * Wired to POST /api/rotate — degrees (preset ±90/180, or fine angle
 * in -45..45) and background hex for arbitrary-angle fill (default
 * transparent → PNG output).
 */
const PRESETS = [
  { label: "-90°", icon: RotateCcw, angle: -90 },
  { label: "+90°", icon: RotateCw, angle: 90 },
  { label: "180° Flip", icon: RefreshCw, angle: 180 },
];

export function RotateTool() {
  const [angle, setAngle] = useState(90);
  const [fine, setFine] = useState(0);
  const [background, setBackground] = useState("#000000");
  const [useBackground, setUseBackground] = useState(false);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const totalRotation = angle + fine;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("degrees", String(totalRotation));
    if (useBackground) fd.append("background", background);
    await state.run("/api/rotate", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  const reset = () => {
    setAngle(90);
    setFine(0);
    setUseBackground(false);
    state.reset();
  };

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
      {/* Canvas Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-stack-md overflow-y-auto bg-black p-gutter">
        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#27272A 1px, transparent 1px)",
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
          <div className="relative z-10 flex max-h-full w-full max-w-4xl flex-col gap-stack-sm overflow-y-auto">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Rotated" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Rotating…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Rotated Image" />
            ) : null}
          </div>
        )}

        {/* Floating Canvas Actions */}
        <CanvasToolbar position="bottom-gutter" />
      </div>

      {/* Right Tool Panel (Rotate Settings) */}
      <ToolPanel
        title="Rotate"
        description="Turn images clockwise or counter-clockwise."
        footer={
          <PanelFooterActions
            onReset={reset}
            applyLabel={processing ? "Working…" : "Apply"}
            onApply={run}
            applyIcon={<Download className="size-4" />}
          />
        }
      >
        {/* Presets */}
        <div className="flex flex-col gap-stack-sm">
          <label className="font-label-md text-label-md text-primary">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setAngle(preset.angle);
                  setFine(0);
                }}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:border-outline-variant hover:bg-muted",
                  i === 2 && "col-span-2",
                  angle === preset.angle && "border-accent-lavender bg-muted"
                )}
              >
                <preset.icon className="text-text-secondary transition-colors group-hover:text-primary" />
                <span className="font-label-sm text-label-sm text-text-secondary transition-colors group-hover:text-primary">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fine-tune slider */}
        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-primary">Angle</label>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface-container-high px-2 py-1">
              <input
                type="number"
                min={-45}
                max={45}
                value={fine}
                aria-label="Fine angle"
                onChange={(e) => setFine(Number(e.target.value))}
                className="w-12 border-none bg-transparent p-0 text-right font-label-md text-label-md text-primary focus:ring-0"
              />
              <span className="font-label-md text-label-md text-text-secondary">°</span>
            </div>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            value={fine}
            aria-label="Angle slider"
            onChange={(e) => setFine(Number(e.target.value))}
            className="slider-thumb relative z-10 w-full"
          />
          <div className="flex justify-between px-1 font-label-sm text-label-sm text-text-secondary">
            <span>-45°</span>
            <span>0°</span>
            <span>45°</span>
          </div>
          <p className="font-label-sm text-label-sm text-outline">
            Final rotation: {totalRotation}°
          </p>
        </div>

        {/* Background for non-90° angles */}
        <div className="flex flex-col gap-stack-sm border-t border-border pt-stack-sm">
          <label className="flex items-center justify-between font-label-md text-label-md text-primary">
            Fill Color (non-90° angles)
            <input
              type="checkbox"
              checked={useBackground}
              onChange={(e) => setUseBackground(e.target.checked)}
              className="rounded border-border bg-surface text-accent-lavender focus:ring-accent-lavender"
            />
          </label>
          <input
            type="color"
            value={background}
            disabled={!useBackground}
            onChange={(e) => setBackground(e.target.value)}
            aria-label="Rotation fill color"
            className="h-10 w-full cursor-pointer rounded-md border border-border bg-surface-container disabled:opacity-40"
          />
          <p className="font-label-sm text-label-sm text-outline">
            Leave unchecked for a transparent fill (PNG output).
          </p>
        </div>
      </ToolPanel>
    </div>
  );
}
