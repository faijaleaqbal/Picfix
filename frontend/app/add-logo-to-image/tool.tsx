"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PositionGrid } from "@/components/site/workspace";
import { PanelFooterActions, ToolPanel, SliderControl } from "@/components/site/tool-panel";
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Canvas Area */}
      <div className="relative flex min-h-[300px] max-h-[48vh] w-full flex-1 flex-col items-center justify-center gap-3 overflow-y-auto bg-[#f4f5fa] border-b border-border/60 p-4 sm:p-6 md:max-h-none md:border-b-0 md:border-r md:p-8">
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
            title="Drag & Drop Base Image"
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
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="With Logo" />
            </div>
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Compositing logo onto image…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Image with Logo" />
            ) : null}
          </div>
        )}
      </div>


      {/* Right Tool Panel (Settings) */}
      <ToolPanel
        title="Logo Settings"
        description="Overlay your logo or watermark with custom sizing."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={reset}
            applyLabel={processing ? "Compositing…" : "Apply Logo"}
            onApply={run}
            disabled={!file || !logoFile}
            loading={processing}
            applyIcon={<Check className="size-4" />}
          />
        }
      >
        {/* 1. Upload Logo Section */}
        <div className="space-y-2">
          <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            1. Select Logo File
          </label>
          <UploadDropzone
            title={logoFile ? logoFile.name : "Tap to choose logo"}
            description="PNG, SVG, or JPG (max 15MB)"
            buttonLabel="Select Logo"
            onFileSelected={handleLogo}
            selectedName={logoFile?.name ?? null}
            error={logoError}
            className="py-4"
          />
        </div>

        {/* 2. Position Grid */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold uppercase tracking-wider text-text-secondary">
              2. Anchor Position
            </span>
            <span className="font-mono text-xs font-semibold text-accent-lavender capitalize">
              {POSITIONS[positionIdx]?.replace("-", " ")}
            </span>
          </div>
          <div className="flex justify-center rounded-xl border border-border bg-surface-container-low p-2">
            <PositionGrid
              value={positionIdx}
              onChange={setPositionIdx}
              size="size-8"
              className="w-auto gap-2"
            />
          </div>
        </div>

        {/* 3. Sizing & Transparency Sliders */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            3. Scale & Transparency
          </div>

          <SliderControl
            label="Logo Scale"
            value={scale}
            min={1}
            max={100}
            unit="%"
            onChange={setScale}
          />

          <SliderControl
            label="Opacity"
            value={opacity}
            min={0}
            max={100}
            unit="%"
            onChange={setOpacity}
          />

          <SliderControl
            label="Corner Margin"
            value={margin}
            min={0}
            max={100}
            unit="px"
            onChange={setMargin}
          />
        </div>
      </ToolPanel>
    </div>
  );
}
