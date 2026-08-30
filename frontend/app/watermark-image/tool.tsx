"use client";

import { useState } from "react";
import { Check, FileImage, Type } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { PositionGrid } from "@/components/site/workspace";
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
import { validateUpload } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Watermark tool.
 *
 * Wired to POST /api/watermark — multipart with BOTH file fields the
 * backend's multer.fields() expects:
 *   image      → base image
 *   watermark  → logo image (when type=logo)
 *   text       → text watermark (when type=text)
 * Plus position (9 anchors), opacity (0-1), scale (0.01-1), fontSize, color.
 */

/** PositionGrid indices map to the backend's 9 anchors. */
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

export function WatermarkTool() {
  const [type, setType] = useState<"text" | "logo">("text");
  const [text, setText] = useState("LUMINA EDIT");
  const [opacity, setOpacity] = useState(45);
  const [positionIdx, setPositionIdx] = useState(8); // bottom-right
  const [scale, setScale] = useState(50);
  const [fontSize, setFontSize] = useState(48);
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
    fd.append("position", POSITIONS[positionIdx] ?? "bottom-right");
    fd.append("opacity", String(opacity / 100));
    if (type === "text") {
      fd.append("text", text);
      fd.append("fontSize", String(fontSize));
    } else {
      if (!logoFile) {
        setLogoError("Select a logo image first.");
        return;
      }
      fd.append("watermark", logoFile);
      fd.append("scale", String(Math.min(1, Math.max(0.01, scale / 100))));
    }
    await state.run("/api/watermark", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="grid grid-cols-1 gap-stack-md lg:grid-cols-12 lg:gap-stack-lg">
      {/* Left Column: Upload & Settings */}
      <div className="flex flex-col gap-stack-md lg:col-span-4">
        <UploadDropzone
          title="Drag and drop an image here"
          description="or click to browse"
          buttonLabel="Select Image"
          size="default"
          onFileSelected={state.selectFile}
          selectedName={state.file?.name ?? null}
        />

        {/* Settings Panel */}
        <div className="flex flex-col gap-stack-md rounded-xl border border-border bg-surface p-stack-md">
          <h3 className="border-b border-border pb-2 font-headline-md text-lg text-primary">
            Watermark Settings
          </h3>

          {/* Type Selection */}
          <div>
            <label className="mb-2 block font-label-md text-label-md text-text-secondary">
              Watermark Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-container-high p-1">
              <button
                type="button"
                onClick={() => setType("text")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-1.5 font-label-md text-label-md transition-colors",
                  type === "text"
                    ? "border-border bg-surface text-primary shadow-sm"
                    : "border-transparent bg-transparent text-text-secondary hover:text-primary"
                )}
              >
                <Type className="text-sm" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setType("logo")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border py-1.5 font-label-md text-label-md transition-colors",
                  type === "logo"
                    ? "border-border bg-surface text-primary shadow-sm"
                    : "border-transparent bg-transparent text-text-secondary hover:text-primary"
                )}
              >
                <FileImage className="text-sm" />
                Logo
              </button>
            </div>
          </div>

          {/* Text Input (visible when Text selected) */}
          {type === "text" ? (
            <>
              <div>
                <label
                  htmlFor="watermark-text"
                  className="mb-2 block font-label-md text-label-md text-text-secondary"
                >
                  Watermark Text
                </label>
                <input
                  id="watermark-text"
                  type="text"
                  value={text}
                  aria-label="Watermark text"
                  onChange={(e) => setText(e.target.value)}
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 font-body-md text-primary transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-lavender"
                />
              </div>
              <div>
                <label
                  htmlFor="watermark-fontsize"
                  className="mb-2 block font-label-md text-label-md text-text-secondary"
                >
                  Font Size
                </label>
                <input
                  id="watermark-fontsize"
                  type="number"
                  min={8}
                  max={500}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value) || 48)}
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 font-body-md text-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent-lavender"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-2 block font-label-md text-label-md text-text-secondary">
                Logo Image
              </label>
              <UploadDropzone
                title="Click to upload logo"
                description="SVG, PNG or JPG (max 15MB)"
                buttonLabel="Select Logo"
                size="default"
                onFileSelected={handleLogo}
                selectedName={logoFile?.name ?? null}
                error={logoError}
              />
            </div>
          )}

          {/* Opacity Slider */}
          <div>
            <div className="mb-2 flex justify-between">
              <label htmlFor="wm-opacity" className="font-label-md text-label-md text-text-secondary">Opacity</label>
              <span className="font-label-sm text-label-sm text-primary">{opacity}%</span>
            </div>
            <input
              id="wm-opacity"
              type="range"
              min={0}
              max={100}
              value={opacity}
              aria-label="Watermark opacity"
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>

          {/* Position Grid */}
          <div>
            <label className="mb-2 block font-label-md text-label-md text-text-secondary">
              Position
            </label>
            <PositionGrid value={positionIdx} onChange={setPositionIdx} className="mx-auto" />
          </div>

          {/* Scale Slider (logo mode only) */}
          {type === "logo" ? (
            <div>
              <div className="mb-2 flex justify-between">
                <label htmlFor="wm-scale" className="font-label-md text-label-md text-text-secondary">Logo Scale</label>
                <span className="font-label-sm text-label-sm text-primary">{scale}% of image width</span>
              </div>
              <input
                id="wm-scale"
                type="range"
                min={5}
                max={100}
                value={scale}
                aria-label="Watermark scale"
                onChange={(e) => setScale(Number(e.target.value))}
                className="slider-thumb w-full"
              />
            </div>
          ) : null}

          <PanelCta
            label={processing ? "Applying…" : "Apply Watermark"}
            icon={<Check className="size-4" />}
            disabled={!file || processing || (type === "text" && !text.trim())}
            onClick={run}
          />
        </div>
      </div>

      {/* Right Column: Live Preview */}
      <div className="flex h-full flex-col gap-stack-md lg:col-span-8">
        <div className="relative flex min-h-[500px] flex-grow flex-col items-center justify-center gap-stack-md overflow-y-auto rounded-xl border border-border bg-surface p-4">
          {/* Dotted texture background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#27272A 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          {!file && !result ? (
            <p className="relative font-body-md text-body-md text-text-secondary">
              Upload an image, choose your watermark style, then apply.
            </p>
          ) : (
            <div className="relative flex w-full flex-col gap-stack-sm">
              <BeforeAfter
                originalUrl={originalUrl}
                resultUrl={resultUrl}
                resultLabel="Watermarked"
              />
              {result ? <ResultMeta result={result} originalSize={file?.size ?? null} /> : null}
            </div>
          )}
          {processing ? <LoadingIndicator label="Compositing watermark…" /> : null}
          {error ? <ProcessError message={error} code={errorCode} /> : null}
          {result ? (
            <DownloadButton onClick={state.download} label="Download Watermarked Image" className="max-w-sm" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
