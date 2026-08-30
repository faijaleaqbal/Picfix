"use client";

import { useEffect, useState } from "react";
import { Crosshair, Download, Globe, Sparkles } from "lucide-react";
import { ToggleSwitch } from "@/components/site/workspace";
import { PanelCta } from "@/components/site/panel-cta";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import {
  AiPending,
  BeforeAfter,
  DownloadButton,
  LoadingIndicator,
  ProcessError,
  ResultMeta,
} from "@/components/site/process-result";
import { useProcessing } from "@/lib/use-processing";
import { DEFAULT_TIMEOUTS, fetchJson, processAiJob } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Passport photo tool.
 *
 * Wired to GET /api/passport-photo/presets for the country list and
 * POST /api/passport-photo with preset + format (+ optional crop from
 * the AI face-detect contract). "Auto Center Face" calls the
 * /api/ai/detect-face stub — currently a 501 (AI_NOT_IMPLEMENTED) —
 * and falls back to the backend's center-crop, surfacing "AI features
 * coming soon" without failing the flow.
 */
interface PresetInfo {
  label: string;
  width: number;
  height: number;
  dpi?: number;
  notes?: string;
}

export function PassportPhotoTool() {
  const [presets, setPresets] = useState<Record<string, PresetInfo> | null>(null);
  const [presetKey, setPresetKey] = useState("2x2-inch");
  const [presetError, setPresetError] = useState<string | null>(null);
  const [format, setFormat] = useState("jpeg");
  const [autoCenter, setAutoCenter] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "checking" | "unavailable">("idle");
  const [aiFacePending, setAiFacePending] = useState(false);
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode, aiPending } = state;

  useEffect(() => {
    fetchJson<{ presets: Record<string, PresetInfo> }>("/api/passport-photo/presets")
      .then((data) => {
        setPresets(data.presets);
        if (!data.presets[presetKey]) {
          setPresetKey(Object.keys(data.presets)[0] ?? "2x2-inch");
        }
      })
      .catch(() =>
        setPresetError("Couldn't load the country presets — the backend may be offline.")
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Submit AI face detection (async job) and poll for the bounding box.
   * On any failure (AI down / rate limited / queue busy / timeout),
   * fall back to the backend's center-crop and show "coming soon".
   */
  const detectFace = async (): Promise<{ x: number; y: number; width: number; height: number } | null> => {
    if (!file) return null;
    setAiStatus("checking");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const out = await processAiJob("/api/ai/detect-face", fd);
      const box = out.result as { x: number; y: number; width: number; height: number } | null;
      setAiStatus("idle");
      if (box && box.width > 0) {
        // Expand the face box into a head-and-shoulders passport crop.
        const w = Math.round(box.width * 2.2);
        const h = Math.round(box.height * 2.6);
        return {
          x: Math.max(0, Math.round(box.x - box.width * 0.6)),
          y: Math.max(0, Math.round(box.y - box.height * 0.8)),
          width: w,
          height: h,
        };
      }
      return null;
    } catch {
      // AI unavailable / rate limited / timed out → center-crop fallback.
      setAiStatus("unavailable");
      setAiFacePending(true);
      return null;
    }
  };

  const run = async () => {
    setAiFacePending(false);
    let crop: { x: number; y: number; width: number; height: number } | null = null;
    if (autoCenter) crop = await detectFace();
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("preset", presetKey);
    fd.append("format", format);
    fd.append("quality", "92");
    if (crop) {
      fd.append("x", String(crop.x));
      fd.append("y", String(crop.y));
      fd.append("width", String(crop.width));
      fd.append("height", String(crop.height));
    }
    await state.run("/api/passport-photo", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  const entries: [string, PresetInfo][] = presets
    ? Object.entries(presets)
    : [["2x2-inch", { label: 'USA (2" x 2")', width: 600, height: 600 } as PresetInfo]];

  return (
    <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
      {/* Canvas Area */}
      <div className="flex flex-col gap-stack-md lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Drag & drop your photo here"
            description="or click to browse from your device"
            buttonLabel="Select Image"
            hint="Passport photos work best with a clear, front-facing portrait."
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
          />
        ) : (
          <div className="flex min-h-[500px] w-full flex-col items-center justify-center gap-stack-sm overflow-hidden rounded-xl border border-border bg-surface p-stack-md">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Passport Photo" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
          </div>
        )}
        {processing ? <LoadingIndicator label="Applying passport preset…" /> : null}
        {error && !aiFacePending ? <ProcessError message={error} code={errorCode} /> : null}
        {aiFacePending || aiPending ? (
          <AiPending className="mb-2" />
        ) : null}
        {aiStatus === "checking" ? (
          <LoadingIndicator label="Checking AI face detection availability…" />
        ) : null}
        {result ? (
          <DownloadButton onClick={state.download} label="Download Passport Photo" />
        ) : null}
      </div>

      {/* Settings Sidebar */}
      <div className="flex flex-col gap-stack-md lg:col-span-4">
        {/* Presets Card */}
        <div className="rounded-xl border border-border bg-surface p-stack-md">
          <h3 className="mb-stack-sm flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
            <Globe className="text-accent-lavender" />
            Country Presets
          </h3>
          <p className="mb-stack-md font-label-sm text-label-sm text-text-secondary">
            Sizes are fetched live from the backend preset registry.
          </p>
          {presetError ? (
            <p className="mb-2 rounded-md border border-error/40 bg-error/10 px-3 py-2 font-label-sm text-label-sm text-error">
              {presetError}
            </p>
          ) : null}
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {entries.map(([key, preset]) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border border-transparent bg-surface-container-high p-3 transition-colors hover:border-accent-lavender/50",
                  presetKey === key && "border-accent-lavender/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="passport-preset"
                    checked={presetKey === key}
                    onChange={() => setPresetKey(key)}
                    className="border-border bg-surface-lowest text-accent-lavender focus:ring-accent-lavender"
                  />
                  <span className="font-label-md text-label-md text-primary">{preset.label}</span>
                </div>
                <span className="font-label-sm text-label-sm text-text-secondary">
                  {preset.width}×{preset.height}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Alignment Guides Card */}
        <div className="rounded-xl border border-border bg-surface p-stack-md">
          <h3 className="mb-stack-md flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
            <Crosshair className="text-accent-lavender" />
            Alignment
          </h3>
          <div className="mb-2 flex items-center justify-between border-b border-border py-2">
            <span className="flex items-center gap-1 font-label-md text-label-md text-primary">
              Auto Center Face
              <Sparkles className="size-3.5 text-accent-lavender" />
            </span>
            <ToggleSwitch
              defaultChecked={autoCenter}
              label="Auto center face"
              scale="md"
              onChange={() => setAutoCenter((v) => !v)}
            />
          </div>
          <p className="mt-2 font-label-sm text-label-sm text-text-secondary">
            {autoCenter
              ? "Face detection is being finalized; your photo will be center-cropped in the meantime."
              : "The photo is center-cropped to the preset's official aspect ratio."}
          </p>
        </div>

        {/* Output Options */}
        <div className="mt-auto rounded-xl border border-border bg-surface p-stack-md">
          <h3 className="mb-3 font-label-md text-label-md uppercase tracking-wider text-text-secondary">
            Output
          </h3>
          <select
            value={format}
            aria-label="Output format"
            onChange={(e) => setFormat(e.target.value)}
            className="mb-4 w-full rounded-md border border-border bg-surface-container-low px-3 py-2 font-label-md text-label-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-lavender"
          >
            <option value="jpeg">JPEG (recommended)</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
          <PanelCta
            label={processing ? "Processing…" : "Download Result"}
            icon={<Download className="size-4" />}
            disabled={!file || processing}
            onClick={run}
            hint={file ? undefined : "Select a photo first"}
          />
        </div>
      </div>
    </div>
  );
}
