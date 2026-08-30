"use client";

import { useState } from "react";
import {
  Diamond,
  Loader2,
  MoveHorizontal,
  SlidersHorizontal,
  Wand2,
} from "lucide-react";
import { CanvasImage, ToggleSwitch } from "@/components/site/workspace";
import { PanelCta } from "@/components/site/panel-cta";
import { AiPending, ProcessError } from "@/components/site/process-result";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { useProcessing } from "@/lib/use-processing";
import { cn } from "@/lib/utils";

/**
 * AI Enhance tool.
 *
 * AI endpoints are asynchronous now: POST /api/ai/remove-background
 * returns 202 { jobId } and the client polls the status endpoint until
 * done, then downloads the PNG via the result URL. There is still no
 * real "upscaling" endpoint — "Enhance" probes remove-background to
 * surface AI availability in the before/after slider.
 */
const FACTORS = ["2x", "4x", "8x"];

export function AiEnhanceTool() {
  const [factor, setFactor] = useState("2x");
  const [denoise, setDenoise] = useState(65);
  const [faceRefine, setFaceRefine] = useState(true);
  const [uploaded, setUploaded] = useState(false);
  const [split, setSplit] = useState(50);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [aiComingSoon, setAiComingSoon] = useState(false);
  const state = useProcessing();
  const { processing } = state;

  const handleFile = (f: File) => {
    state.selectFile(f);
    setUploaded(true);
    setEnhanceError(null);
    setAiComingSoon(false);
  };

  const handleEnhance = async () => {
    if (!state.file) return;
    setAiComingSoon(false);
    setEnhanceError(null);
    const fd = new FormData();
    fd.append("image", state.file);
    const ok = await state.runAi("/api/ai/remove-background", fd);
    if (!ok) {
      // Queue busy / rate limited / AI down — show the pending state,
      // never a hard error for the user.
      setAiComingSoon(true);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column: Tool Area */}
      <div className="flex flex-col gap-8 lg:col-span-8">
        {/* Upload / Preview Canvas */}
        <div className="glass-panel group relative flex h-[400px] flex-col items-center justify-center overflow-hidden rounded-xl md:h-[500px]">
          {!uploaded || !state.file ? (
            <UploadDropzone
              title="Drag & Drop Image"
              description="or click to browse from your computer"
              buttonLabel="Select File"
              size="lg"
              onFileSelected={handleFile}
              selectedName={state.file?.name ?? null}
              busy={processing}
              className="h-full w-full border-none bg-transparent hover:border-none"
            />
          ) : state.resultUrl ? (
            <div className="before-after-slider relative h-full w-full overflow-hidden rounded-xl">
              {/* Before */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.originalUrl ?? ""}
                alt="Original image"
                className="absolute inset-0 h-full w-full object-contain opacity-70 blur-[1.5px]"
              />
              {/* After — clipped to the split position */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${split}%)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.resultUrl}
                  alt="Enhanced result"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Slider handle */}
              <div
                className="absolute bottom-0 top-0 z-10 w-0.5 -translate-x-1/2 cursor-ew-resize bg-accent-lavender"
                style={{ left: `${split}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent-lavender bg-background text-accent-lavender">
                  <MoveHorizontal className="size-4" />
                </div>
              </div>
              {/* Labels */}
              <div className="absolute left-4 top-4 z-20 rounded-full border border-border bg-background/80 px-3 py-1 backdrop-blur-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                  Before
                </span>
              </div>
              <div className="absolute right-4 top-4 z-20 rounded-full border border-border bg-background/80 px-3 py-1 backdrop-blur-md">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                  After
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={split}
                aria-label="Before after comparison"
                onChange={(e) => setSplit(Number(e.target.value))}
                className="slider-thumb absolute bottom-4 left-1/2 z-20 w-2/3 -translate-x-1/2"
              />
            </div>
          ) : (
            <CanvasImage
              caption="Your uploaded image, waiting for AI enhancement."
              seed={163}
              rounded="rounded-none"
              className="h-full w-full"
            />
          )}
        </div>

        {aiComingSoon ? <AiPending /> : null}
        {enhanceError ? <ProcessError message={enhanceError} code={state.errorCode} /> : null}
      </div>

      {/* Right Column: Settings Panel */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-border bg-surface p-6">
          <h3 className="flex items-center gap-2 border-b border-border pb-4 font-headline-md text-headline-md text-primary">
            <SlidersHorizontal className="text-accent-lavender" />
            Enhancement Settings
          </h3>

          {/* Upscale Factor */}
          <div className="mb-6">
            <label className="mb-3 block font-label-md text-label-md text-primary">
              Upscale Factor
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FACTORS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFactor(f)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-md border py-2 font-body-md text-body-md transition-colors",
                    factor === f
                      ? "border-accent-lavender bg-surface text-accent-lavender hover:bg-surface-container-high"
                      : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
                  )}
                >
                  {f}
                  {f === "8x" ? <Diamond className="text-[16px] text-accent-lavender" /> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Denoise Intensity */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="denoise" className="font-label-md text-label-md text-primary">
                Denoise Intensity
              </label>
              <span className="font-label-sm text-label-sm text-text-secondary">
                {denoise}%
              </span>
            </div>
            <input
              id="denoise"
              type="range"
              min={0}
              max={100}
              value={denoise}
              aria-label="Denoise intensity"
              onChange={(e) => setDenoise(Number(e.target.value))}
              className="slider-thumb w-full"
            />
          </div>

          {/* Face Refinement Toggle */}
          <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-surface p-4">
            <div>
              <p className="font-label-md text-label-md text-primary">Face Refinement</p>
              <p className="mt-1 font-label-sm text-label-sm text-text-secondary">
                Restore details in portraits.
              </p>
            </div>
            <ToggleSwitch
              defaultChecked={faceRefine}
              label="Face refinement"
              scale="md"
              onChange={() => setFaceRefine((v) => !v)}
            />
          </div>

          {/* Enhance Button */}
          <PanelCta
            label={processing ? "Processing..." : "Enhance Image"}
            icon={
              processing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Wand2 className="size-5" />
              )
            }
            onClick={handleEnhance}
            disabled={processing || !state.file}
            hint={
              state.file
                ? "AI upscaling service is being finalized."
                : "Select a file to enable enhancement"
            }
          />
        </div>
      </div>
    </div>
  );
}
