"use client";

import { useState } from "react";
import { Check, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { PositionGrid } from "@/components/site/workspace";
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
import { validateUpload } from "@/lib/config";

/**
 * Add-Logo workbench.
 *
 * Wired to POST /api/watermark with the "watermark" file field holding
 * the logo — position (9 anchors), opacity, scale (logo width as
 * fraction of base width), margin all sent as form fields.
 */
const POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

export function AddLogoTool() {
  const [positionIdx, setPositionIdx] = useState(8); // bottom-right
  const [scale, setScale] = useState(25);
  const [opacity, setOpacity] = useState(100);
  const [margin, setMargin] = useState(24);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const handleLogo = (f: File | null) => {
    if (!f) return;
    const err = validateUpload(f);
    setLogoError(err);
    setLogoFile(err ? null : f);
  };

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("watermark", logoFile!);
    fd.append("position", POSITIONS[positionIdx] ?? "bottom-right");
    fd.append("opacity", String(opacity / 100));
    fd.append("scale", String(Math.min(1, Math.max(0.01, scale / 100))));
    fd.append("margin", String(margin));
    await state.run("/api/watermark", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  const reset = () => {
    setPositionIdx(8);
    setScale(25);
    setOpacity(100);
    setMargin(24);
    setLogoFile(null);
    setLogoError(null);
    state.reset();
  };

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Canvas Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-stack-md overflow-y-auto bg-surface-dim p-gutter">
        {/* Checkerboard background for transparency context */}
        <div
          className="absolute inset-0 z-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #1c1b1d 25%, transparent 25%), linear-gradient(-45deg, #1c1b1d 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1b1d 75%), linear-gradient(-45deg, transparent 75%, #1c1b1d 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
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
          <div className="relative z-10 flex w-full max-w-3xl flex-col gap-stack-sm">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="With Logo" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Compositing logo…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Image with Logo" />
            ) : null}
          </div>
        )}

        {/* Top Floating Tools (Zoom/Pan) */}
        <div className="absolute right-gutter top-gutter z-20 flex rounded-full border border-border bg-surface-container-low p-1 shadow-lg">
          <button
            type="button"
            aria-label="Zoom in"
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <ZoomIn className="size-5" />
          </button>
          <div className="mx-1 my-auto h-6 w-px bg-border" />
          <button
            type="button"
            aria-label="Zoom out"
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <ZoomOut className="size-5" />
          </button>
          <div className="mx-1 my-auto h-6 w-px bg-border" />
          <button
            type="button"
            aria-label="Fit screen"
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <Maximize className="size-5" />
          </button>
        </div>
      </div>

      {/* Right Tool Panel (Settings) */}
      <ToolPanel
        title="Add Logo"
        description="Embed your brand mark with precision."
        footer={
          <PanelFooterActions
            onReset={reset}
            applyLabel={processing ? "Working…" : "Apply"}
            onApply={run}
            applyIcon={<Check className="size-4" />}
          />
        }
      >
        {/* Upload Section */}
        <div>
          <label className="mb-2 block font-label-md text-label-md text-primary">
            Logo Image
          </label>
          <UploadDropzone
            title="Click to upload logo"
            description="SVG, PNG or JPG (max 15MB)"
            buttonLabel="Select Logo"
            onFileSelected={handleLogo}
            selectedName={logoFile?.name ?? null}
            error={logoError}
          />
        </div>

        {/* Base image */}
        <div>
          <label className="mb-2 block font-label-md text-label-md text-primary">
            Base Image
          </label>
          {file ? (
            <p className="rounded-md border border-border bg-surface-container-low px-3 py-2 font-label-sm text-label-sm text-primary">
              {file.name} selected
            </p>
          ) : (
            <p className="font-label-sm text-label-sm text-outline">
              Use the canvas drop zone to pick the base image.
            </p>
          )}
        </div>

        {/* Position Grid */}
        <div>
          <label className="mb-2 block font-label-md text-label-md text-primary">
            Position
          </label>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface-container-low p-2">
            <PositionGrid
              value={positionIdx}
              onChange={setPositionIdx}
              size="aspect-square w-full border-none bg-transparent"
              className="mx-0 w-full gap-2"
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="logo-scale" className="font-label-md text-label-md text-primary">Scale</label>
              <span className="rounded-md border border-border bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-text-secondary">
                {scale}%
              </span>
            </div>
            <input
              id="logo-scale"
              type="range"
              min={1}
              max={100}
              value={scale}
              aria-label="Logo scale"
              onChange={(e) => setScale(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="logo-opacity" className="font-label-md text-label-md text-primary">Opacity</label>
              <span className="rounded-md border border-border bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-text-secondary">
                {opacity}%
              </span>
            </div>
            <input
              id="logo-opacity"
              type="range"
              min={0}
              max={100}
              value={opacity}
              aria-label="Logo opacity"
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="logo-margin" className="font-label-md text-label-md text-primary">Margin</label>
              <span className="rounded-md border border-border bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-text-secondary">
                {margin}px
              </span>
            </div>
            <input
              id="logo-margin"
              type="range"
              min={0}
              max={100}
              value={margin}
              aria-label="Logo margin"
              onChange={(e) => setMargin(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}
