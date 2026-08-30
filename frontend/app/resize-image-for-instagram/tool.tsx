"use client";

import { useState } from "react";
import { Check, Download, RectangleVertical, Smartphone, Square, Tv } from "lucide-react";
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
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-surface-dim lg:flex-row">
      {/* Tool Settings Panel */}
      <section className="flex h-full w-full shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-surface lg:w-[320px]">
        <div className="shrink-0 border-b border-outline-variant p-gutter">
          <h1 className="mb-1 font-headline-md text-headline-md text-primary">
            Instagram Resize
          </h1>
          <p className="font-body-md text-body-md text-text-secondary">
            Optimize images for feed, stories, or profile pictures.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-stack-lg p-gutter">
          {/* Presets */}
          <div className="flex flex-col gap-stack-sm">
            <label className="flex items-center justify-between font-label-md text-label-md text-primary">
              Format Preset
            </label>
            <div className="grid grid-cols-2 gap-stack-sm">
              {PRESETS.map((p) => {
                const active = preset === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPreset(p.name)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-xl border p-3 transition-colors",
                      active
                        ? "border-accent-lavender bg-secondary-container/20 hover:bg-secondary-container/30"
                        : "border-border bg-background hover:bg-surface-variant"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 flex items-center justify-center rounded-sm border-2",
                        p.box,
                        active
                          ? "border-accent-lavender"
                          : "border-text-secondary group-hover:border-primary"
                      )}
                    >
                      <p.icon
                        className={cn(
                          "size-4",
                          active ? "text-accent-lavender" : "text-text-secondary"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-label-sm text-label-sm",
                        active ? "text-accent-lavender" : "text-text-secondary"
                      )}
                    >
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "mt-1 text-[10px]",
                        active ? "text-on-secondary-container opacity-80" : "text-text-secondary opacity-60"
                      )}
                    >
                      {p.dims}
                    </span>
                    {active ? (
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-accent-lavender" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output format */}
          <div className="flex flex-col gap-2">
            <label htmlFor="ig-format" className="font-label-md text-label-md text-primary">Output Format</label>
            <select
              id="ig-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="rounded-md border border-border bg-surface-container-low p-2 font-label-md text-label-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-lavender"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
            <p className="font-label-sm text-label-sm text-outline">
              The image is center-cropped to the exact preset dimensions.
            </p>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 gap-stack-sm border-t border-outline-variant bg-surface p-gutter">
          <button
            type="button"
            onClick={() => {
              setPreset("Square Feed");
              state.reset();
            }}
            className="flex-1 rounded-full border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!file || processing}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-4" />
            {processing ? "Working…" : "Apply"}
          </button>
        </div>
      </section>

      {/* Preview Canvas */}
      <section className="relative flex flex-1 flex-col overflow-y-auto bg-background">
        <div className="pattern-grid relative flex flex-1 items-center justify-center overflow-auto p-8">
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
            <div className="relative z-10 flex w-full max-w-[500px] flex-col gap-stack-sm">
              <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Resized" />
              {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
              {processing ? <LoadingIndicator label="Resizing for Instagram…" /> : null}
              {error ? <ProcessError message={error} code={errorCode} /> : null}
              {result ? (
                <DownloadButton
                  onClick={state.download}
                  label="Download"
                  className="mx-auto max-w-xs"
                  icon={<Download className="size-4" />}
                />
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
