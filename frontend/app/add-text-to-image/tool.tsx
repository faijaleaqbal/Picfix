"use client";

import { useState } from "react";
import { Download } from "lucide-react";
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
import { cn } from "@/lib/utils";

/**
 * Add-Text workbench.
 *
 * Wired to POST /api/add-text — the backend supports: text, fontSize
 * (8-500), color hex, position (9 anchors) or absolute x/y, fontWeight,
 * fontFamily, opacity. Letter-spacing / line-height / alignment remain
 * presentational until the backend extends the contract.
 */
const FONT_OPTIONS = ["sans-serif", "serif", "monospace", "cursive"];

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

const COLOR_MAP: Record<string, string> = {
  White: "#ffffff",
  Black: "#000000",
  Lavender: "#b48cde",
};

export function AddTextTool() {
  const [content, setContent] = useState("Wanderlust");
  const [font, setFont] = useState("sans-serif");
  const [bold, setBold] = useState(true);
  const [size, setSize] = useState(72);
  const [fill, setFill] = useState("White");
  const [opacity, setOpacity] = useState(100);
  const [positionIdx, setPositionIdx] = useState(4); // center
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("text", content);
    fd.append("fontSize", String(size));
    fd.append("color", COLOR_MAP[fill] ?? "#ffffff");
    fd.append("position", POSITIONS[positionIdx] ?? "center");
    fd.append("fontWeight", bold ? "bold" : "normal");
    fd.append("fontFamily", font);
    fd.append("opacity", String(opacity / 100));
    await state.run("/api/add-text", fd, DEFAULT_TIMEOUTS.shortMs);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Canvas Area */}
      <div className="relative flex min-h-[260px] max-h-[48vh] w-full flex-1 flex-col items-center justify-center gap-3 overflow-y-auto bg-black/90 p-4 sm:p-6 md:max-h-none md:p-8">
        {/* Checkerboard background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
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
            className="relative z-10 max-w-xl"
          />
        ) : (
          <div className="relative z-10 flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto">
            <BeforeAfter
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              resultLabel="With Text"
            />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Rendering typography onto image…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download Image with Text" />
            ) : null}
          </div>
        )}
      </div>

      {/* Right Tool Panel (Text Settings) */}
      <ToolPanel
        title="Text Properties"
        description="Overlay custom typography and messaging."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={state.reset}
            applyLabel={processing ? "Rendering…" : "Apply Text"}
            onApply={run}
            disabled={!file || !content.trim()}
            loading={processing}
            applyIcon={<Download className="size-4" />}
          />
        }
      >
        {/* Text Input */}
        <div className="space-y-2">
          <label htmlFor="add-text-content" className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Text Content
          </label>
          <textarea
            id="add-text-content"
            value={content}
            aria-label="Text content"
            placeholder="Type your caption or heading..."
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[84px] w-full resize-y rounded-xl border border-border bg-surface-container-high p-3 font-body-md text-sm text-primary placeholder:text-text-secondary focus:border-accent-lavender focus:outline-none"
          />
        </div>

        {/* Font Family & Bold */}
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div className="space-y-1">
            <label htmlFor="add-text-font" className="text-xs text-text-secondary">Font</label>
            <select
              id="add-text-font"
              value={font}
              aria-label="Font family"
              onChange={(e) => setFont(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-border bg-surface-container-high px-2.5 py-2 text-xs font-semibold text-primary focus:outline-none"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setBold((v) => !v)}
              className={cn(
                "flex h-[38px] items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-all",
                bold
                  ? "border-accent-lavender bg-accent-lavender/15 text-accent-lavender"
                  : "border-border bg-surface-container text-text-secondary hover:text-primary"
              )}
            >
              <span className="font-bold">B</span> Bold
            </button>
          </div>
        </div>

        {/* Position (9 anchors) */}
        <div className="space-y-2 border-t border-border pt-3">
          <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Anchor Position
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {POSITIONS.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setPositionIdx(i)}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-center font-mono text-[11px] capitalize transition-colors",
                  positionIdx === i
                    ? "border-accent-lavender bg-accent-lavender/15 font-semibold text-accent-lavender"
                    : "border-border text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                {p.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Size Slider */}
        <div className="border-t border-border pt-3">
          <SliderControl
            label="Font Size"
            value={size}
            min={8}
            max={200}
            unit="px"
            onChange={setSize}
          />
        </div>

        {/* Color & Opacity */}
        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Fill Color</span>
            <div className="flex items-center gap-2">
              {Object.entries(COLOR_MAP).map(([name]) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={name}
                  onClick={() => setFill(name)}
                  className={cn(
                    "size-7 cursor-pointer rounded-full border border-border transition-transform hover:scale-110",
                    name === "Black" ? "bg-black" : name === "Lavender" ? "bg-[#B48CDE]" : "bg-white",
                    fill === name && "ring-2 ring-accent-lavender ring-offset-2 ring-offset-background"
                  )}
                />
              ))}
            </div>
          </div>

          <SliderControl
            label="Opacity"
            value={opacity}
            min={1}
            max={100}
            unit="%"
            onChange={setOpacity}
          />
        </div>
      </ToolPanel>
    </div>
  );
}
