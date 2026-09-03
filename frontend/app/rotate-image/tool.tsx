"use client";

import { useState } from "react";
import { RotateCcw, RotateCw, RefreshCw } from "lucide-react";
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Canvas Area */}
      <div className="relative flex min-h-[300px] max-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-[#f4f5fa] border-b border-border/60 p-4 sm:p-6 md:max-h-none md:border-b-0 md:border-r md:p-8">
        {/* Light studio canvas grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c7cbe0 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="or tap to browse from your device"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
            className="relative z-10 max-w-xl shadow-sm"
          />
        ) : (
          <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto">
            <div className="overflow-hidden rounded-xl border border-[#d9dcea] bg-white p-2 shadow-sm">
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Rotated" />
            </div>
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Rotating image…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Rotated Image" />
            ) : null}
          </div>
        )}


        {/* Floating Canvas Actions */}
        {file ? <CanvasToolbar position="bottom-3 sm:bottom-6" /> : null}
      </div>

      {/* Right Tool Panel (Rotate Settings) */}
      <ToolPanel
        title="Rotate Settings"
        description="Turn images clockwise, counter-clockwise, or fine-align."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={reset}
            applyLabel={processing ? "Rotating…" : "Apply Rotation"}
            onApply={run}
            disabled={!file}
            loading={processing}
            applyIcon={<RotateCw className="size-4" />}
          />
        }
      >
        {/* Presets */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Quick Angle Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = angle === preset.angle && fine === 0;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setAngle(preset.angle);
                    setFine(0);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 min-h-[50px] transition-all",
                    isSelected
                      ? "border-accent-lavender bg-accent-lavender/15 text-accent-lavender font-semibold ring-1 ring-accent-lavender"
                      : "border-border bg-surface-container-low text-text-secondary hover:border-outline-variant hover:text-primary"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-xs">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-tune SliderControl */}
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold uppercase tracking-wider text-text-secondary">
              Fine Angle Tune
            </span>
            <span className="font-mono text-xs font-semibold text-accent-lavender">
              Total: {totalRotation}°
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="fine-angle" className="text-xs text-text-secondary">
                Angle adjustment (-45° to +45°)
              </label>
              <div className="flex items-center gap-1 rounded-md border border-border bg-surface-container px-2 py-0.5">
                <input
                  id="fine-angle"
                  type="number"
                  min={-45}
                  max={45}
                  value={fine}
                  aria-label="Fine angle adjustment"
                  onChange={(e) => setFine(Number(e.target.value))}
                  className="w-12 border-none bg-transparent p-0 text-right font-mono text-xs font-semibold text-primary focus:ring-0"
                />
                <span className="text-xs text-text-secondary">°</span>
              </div>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              value={fine}
              aria-label="Angle slider"
              onChange={(e) => setFine(Number(e.target.value))}
              className="slider-thumb w-full h-2 rounded-lg bg-surface-container-high appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>-45°</span>
              <span>0°</span>
              <span>+45°</span>
            </div>
          </div>
        </div>

        {/* Background fill for custom angles */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center justify-between font-label-md text-xs sm:text-sm text-primary">
            <span>Fill Background (for tilted angles)</span>
            <input
              type="checkbox"
              checked={useBackground}
              onChange={(e) => setUseBackground(e.target.checked)}
              className="size-4 rounded border-border bg-surface text-accent-lavender focus:ring-accent-lavender"
            />
          </label>
          {useBackground ? (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                aria-label="Rotation fill color"
                className="h-10 w-16 cursor-pointer rounded-lg border border-border bg-surface-container"
              />
              <span className="font-mono text-xs text-text-secondary">{background}</span>
            </div>
          ) : (
            <p className="text-[11px] text-outline">
              Unchecked = transparent canvas fill (PNG export).
            </p>
          )}
        </div>
      </ToolPanel>
    </div>
  );
}
