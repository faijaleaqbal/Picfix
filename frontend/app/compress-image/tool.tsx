"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
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
import { DEFAULT_TIMEOUTS } from "@/lib/api";
import { formatBytes } from "@/lib/config";

/**
 * Compress Image tool. Left: upload + before/after preview; right:
 * compression settings (target file size + output format).
 *
 * Wired to POST /api/compress — sends `targetSize` (KB value as bytes,
 * min 1024) and `format` (jpeg|webp). The backend runs an iterative
 * quality search (max 8 iterations) to land within ±5% of the target,
 * which is why this call gets a longer timeout than other tools.
 */
const SIZE_CHIPS = [50, 100, 200, 500, 1000];

export function CompressImageTool() {
  const [targetKb, setTargetKb] = useState(200);
  const [format, setFormat] = useState("jpeg");
  const state = useProcessing();

  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("targetSize", String(Math.max(1, Math.round(targetKb)) * 1024));
    if (format === "jpeg" || format === "webp") fd.append("format", format);
    await state.run("/api/compress", fd, DEFAULT_TIMEOUTS.compressMs);
  };

  const saved =
    result && file
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : null;

  return (
    <div className="grid grid-cols-1 gap-stack-md lg:grid-cols-12">
      {/* Upload & Preview Area (Left / Main) */}
      <div className="flex flex-col gap-stack-md lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="or click to browse from your computer (JPG, PNG, WebP)"
            hint="Free, secure, and processed on our servers."
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-stack-md">
            <h4 className="mb-stack-sm font-label-md text-label-md text-primary">
              Live Preview
            </h4>
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="Compressed" />
            {result ? (
              <ResultMeta result={result} originalSize={file.size} className="mt-stack-sm" />
            ) : null}
          </div>
        )}

        {processing ? (
          <LoadingIndicator label="Searching for the best quality that fits your target size…" />
        ) : null}
        {error && !state.aiPending ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
        {state.aiPending ? <AiPending /> : null}
        {result ? (
          <DownloadButton onClick={state.download} label="Download Compressed Image" />
        ) : null}
      </div>

      {/* Settings Panel (Right / Sidebar) */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 lg:col-span-4">
        <h3 className="border-b border-border pb-3 font-headline-md text-base sm:text-lg font-bold text-primary">
          Compression Settings
        </h3>

        {/* Target File Size */}
        <div className="space-y-2">
          <label
            htmlFor="target-size"
            className="block font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            Target File Size
          </label>
          <div className="flex items-center gap-2">
            <input
              id="target-size"
              type="number"
              min={1}
              max={15000}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-border bg-surface-container-lowest px-3 py-2 font-mono text-sm font-semibold text-primary outline-none transition-all focus:border-accent-lavender focus:ring-1 focus:ring-accent-lavender"
            />
            <span className="font-mono text-xs font-semibold text-text-secondary">KB</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SIZE_CHIPS.map((kb) => (
              <button
                key={kb}
                type="button"
                onClick={() => setTargetKb(kb)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                  targetKb === kb
                    ? "border-accent-lavender bg-accent-lavender/15 font-semibold text-accent-lavender"
                    : "border-border bg-surface-container-low text-text-secondary hover:border-accent-lavender hover:text-primary"
                }`}
              >
                {formatBytes(kb * 1024, 0)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-outline">
            The smart compression engine preserves maximum visual clarity while guaranteeing file size under target.
          </p>
        </div>

        {/* Target Format */}
        <div className="space-y-2 border-t border-border pt-3">
          <label htmlFor="compress-format" className="block font-label-md text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Target Format
          </label>
          <select
            id="compress-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-primary outline-none transition-all focus:border-accent-lavender focus:ring-1 focus:ring-accent-lavender"
          >
            <option value="jpeg">JPEG (Universal photo standard)</option>
            <option value="webp">WebP (Next-gen modern web)</option>
          </select>
        </div>

        {/* Result summary */}
        <div className="space-y-1.5 rounded-xl border border-border bg-surface-container-low p-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Size Optimization
          </label>
          {result && file ? (
            <p className="font-mono text-xs font-semibold text-primary">
              {formatBytes(file.size)} → {formatBytes(result.blob.size)}
              {saved != null ? (
                <span className="text-accent-lavender"> (−{saved}%)</span>
              ) : null}
              {result.qualityUsed != null
                ? ` · Quality ${result.qualityUsed}`
                : ""}
            </p>
          ) : (
            <p className="text-[11px] text-outline">
              Upload an image and run compression to see reduction results.
            </p>
          )}
        </div>

        {/* Primary Action */}
        <PanelCta
          label={processing ? "Compressing…" : "Compress Image"}
          icon={processing ? <ArrowRight className="size-4 animate-pulse" /> : <Check className="size-4" />}
          hint="Iterative quality search — completes in seconds."
          disabled={!file || processing}
          onClick={run}
        />
      </div>
    </div>
  );
}
