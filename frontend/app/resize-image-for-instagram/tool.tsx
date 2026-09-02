"use client";

import { useState } from "react";
import { Check, Download, RectangleVertical, Smartphone, Square, Tv } from "lucide-react";
import { ToolPanel, PanelFooterActions } from "@/components/site/tool-panel";
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
 * Instagram Resize workbench.
 *
 * Wired to POST /api/social-resize — platform preset key
 * (instagram-post | instagram-portrait | instagram-story |
 * instagram-thumbnail) + format/quality. Background fill options stay
 * presentational (backend uses cover-fit center crop).
 */
const PRESETS = [
  { name: "Square Feed", key: "instagram-post", dims: "1080x1080", icon: Square, box: "w-10 h-10" },
  { name: "Portrait Feed", key: "instagram-portrait", dims: "1080x1350", icon: RectangleVertical, box: "w-8 h-10" },
  { name: "Story / Reel", key: "instagram-story", dims: "1080x1920", icon: Smartphone, box: "w-6 h-11" },
  { name: "IGTV Thumb", key: "instagram-thumbnail", dims: "320x320", icon: Tv, box: "w-12 h-7" },
];

export function InstagramResizeTool() {
  const [preset, setPreset] = useState("Square Feed");
  const [format, setFormat] = useState("jpeg");
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("platform", PRESETS.find((p) => p.name === preset)?.key ?? "instagram-post");
    fd.append("format", format);
    fd.append("quality", "92");
    await state.run("/api/social-resize", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col md:h-full md:flex-row md:overflow-hidden">
      {/* Preview Canvas */}
      <div className="relative flex min-h-[260px] max-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto bg-black/90 p-4 sm:p-6 md:max-h-none md:p-8">
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
          <div className="relative z-10 flex max-h-full w-full max-w-2xl flex-col gap-3 overflow-y-auto">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Instagram Ready" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Resizing for Instagram feed…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
            {result ? (
              <DownloadButton
                onClick={state.download}
                label="Download Instagram Image"
                icon={<Download className="size-4" />}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Settings ToolPanel */}
      <ToolPanel
        title="Instagram Presets"
        description="Format and resize images for Instagram feed, stories, and profile."
        collapsibleOnMobile={true}
        footer={
          <PanelFooterActions
            onReset={() => {
              setPreset("Square Feed");
              state.reset();
            }}
            applyLabel={processing ? "Resizing…" : "Apply Preset"}
            onApply={run}
            disabled={!file}
            loading={processing}
            applyIcon={<Check className="size-4" />}
          />
        }
      >
        {/* Presets */}
        <div className="space-y-2">
          <label className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Select Aspect Ratio
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map((p) => {
              const active = preset === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setPreset(p.name)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-3 min-h-[70px] transition-all active:scale-95",
                    active
                      ? "border-accent-lavender bg-accent-lavender/15 text-accent-lavender font-semibold ring-1 ring-accent-lavender"
                      : "border-border bg-surface-container hover:border-accent-lavender hover:bg-surface-container-high text-text-secondary hover:text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1.5 flex items-center justify-center rounded-sm border-2",
                      p.box,
                      active ? "border-accent-lavender" : "border-text-secondary"
                    )}
                  >
                    <p.icon className="size-3.5" />
                  </div>
                  <span className="text-xs">{p.name}</span>
                  <span className="text-[10px] text-text-secondary/80">{p.dims}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output format */}
        <div className="space-y-2 border-t border-border pt-4">
          <label htmlFor="ig-format" className="font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Output Format
          </label>
          <select
            id="ig-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-container px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-accent-lavender"
          >
            <option value="jpeg">JPEG (recommended for photos)</option>
            <option value="png">PNG (lossless graphics)</option>
            <option value="webp">WebP (best web compression)</option>
          </select>
          <p className="text-[11px] text-outline">
            The image will be center-cropped to exact aspect ratio without distortion.
          </p>
        </div>
      </ToolPanel>
    </div>
  );
}
