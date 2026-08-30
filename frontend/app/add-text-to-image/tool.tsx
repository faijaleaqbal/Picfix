"use client";

import { useState } from "react";
import { Download } from "lucide-react";
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
    <div className="relative flex h-full min-w-0 flex-1 overflow-hidden md:flex-row">
      {/* Canvas Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-stack-md overflow-y-auto bg-surface-container-lowest p-4 md:p-8">
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
            description="or click to browse from your device"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
            className="relative z-10 max-w-xl"
          />
        ) : (
          <div className="relative z-10 flex w-full max-w-4xl flex-col gap-stack-sm">
            <BeforeAfter
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              resultLabel="With Text"
            />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Rendering text…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
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
        footer={
          <PanelFooterActions
            onReset={state.reset}
            applyLabel={processing ? "Working…" : "Apply Changes"}
            onApply={run}
            applyIcon={<Download className="size-4" />}
          />
        }
      >
        {/* Text Input */}
        <div className="space-y-3">
          <label htmlFor="add-text-content" className="flex items-center justify-between font-label-md text-label-md text-primary">
            Content
          </label>
          <textarea
            id="add-text-content"
            value={content}
            aria-label="Text content"
            placeholder="Type something..."
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] w-full resize-y rounded-xl border border-border bg-surface-container-high p-4 font-body-md text-primary placeholder:text-text-secondary transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-lavender"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-3">
          <label htmlFor="add-text-font" className="font-label-md text-label-md text-primary">Font Family</label>
          <select
            id="add-text-font"
            value={font}
            aria-label="Font family"
            onChange={(e) => setFont(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-md border border-border bg-surface-container-high px-4 py-3 font-body-md text-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender"
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Style: weight + position (supported by backend) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center justify-between rounded-xl bg-surface-container-high p-3">
            <span className="font-label-md text-label-md text-primary">Bold</span>
            <input
              type="checkbox"
              checked={bold}
              onChange={(e) => setBold(e.target.checked)}
              aria-label="Bold text"
              className="h-4 w-4 rounded border-border text-accent-lavender focus:ring-accent-lavender"
            />
          </div>
        </div>

        {/* Position (9 anchors) */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-primary">Position</label>
          <div className="grid grid-cols-3 gap-2">
            {POSITIONS.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setPositionIdx(i)}
                className={cn(
                  "rounded-md border px-2 py-1 font-label-sm text-label-sm transition-colors",
                  positionIdx === i
                    ? "border-accent-lavender bg-muted text-primary"
                    : "border-border text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                {p.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3 rounded-xl border border-border/50 bg-surface-container-low p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="add-text-size" className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary">
                Size
              </label>
              <span className="rounded bg-surface-variant px-2 py-0.5 text-xs font-label-md text-primary">
                {size}px
              </span>
            </div>
            <input
              id="add-text-size"
              type="range"
              min={8}
              max={200}
              value={size}
              aria-label="Font size"
              onChange={(e) => setSize(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>
        </div>

        {/* Color & Appearance */}
        <div className="space-y-4 border-t border-border pt-6">
          <h4 className="font-label-md text-label-md font-semibold text-primary">Appearance</h4>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-text-secondary">Fill Color</span>
            <div className="flex items-center gap-2">
              {Object.entries(COLOR_MAP).map(([name]) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={name}
                  onClick={() => setFill(name)}
                  className={cn(
                    "h-8 w-8 cursor-pointer rounded-full border border-border transition-transform hover:scale-110",
                    name === "Black" ? "bg-black" : name === "Lavender" ? "bg-[#B48CDE]" : "bg-white",
                    fill === name && "shadow-[0_0_0_2px_#131315,0_0_0_4px_#B48CDE]"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="add-text-opacity" className="font-label-md text-label-md text-text-secondary">Opacity</label>
              <span className="rounded bg-surface-variant px-2 py-0.5 text-xs font-label-md text-primary">
                {opacity}%
              </span>
            </div>
            <input
              id="add-text-opacity"
              type="range"
              min={0}
              max={100}
              value={opacity}
              aria-label="Text opacity"
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}
