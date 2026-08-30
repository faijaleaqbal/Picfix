"use client";

import { useState } from "react";
import { Crop, HardDrive, Wand2, X } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
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
import { formatBytes } from "@/lib/config";

/**
 * PAN Card resize tool.
 *
 * Wired to POST /api/passport-photo with preset=pan-card — the PAN
 * 213×213 requirement is a PASSPORT registry preset on the backend.
 * The UI's stated 30KB target is noted: the backend returns the best
 * 92-quality JPEG at 213×213; the actual size is shown after
 * processing.
 */
export function PanCardTool() {
  const [format, setFormat] = useState("jpeg");
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    const fd = new FormData();
    fd.append("image", file!);
    fd.append("preset", "pan-card");
    fd.append("format", format);
    fd.append("quality", "92");
    await state.run("/api/passport-photo", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="glass-panel z-10 flex flex-col rounded-xl p-stack-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <header className="mb-stack-lg text-center">
        <h1 className="font-headline-lg-mobile mb-2 text-headline-lg-mobile text-primary md:text-headline-lg md:font-headline-lg">
          PAN Card Resize
        </h1>
        <p className="font-body-lg text-body-lg text-text-secondary">
          Specific sizing for ID card applications. Standard dimensions (213x213px) with
          file size limits.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
        {/* Upload / Result Area */}
        {!file ? (
          <UploadDropzone
            title="Drag & Drop Image Here"
            description="or click to browse"
            buttonLabel="Select Image"
            hint="Accepts JPEG or PNG"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
            busy={processing}
          />
        ) : (
          <div className="flex flex-col gap-stack-sm">
            <BeforeAfter originalUrl={originalUrl} resultUrl={resultUrl} resultLabel="PAN (213×213)" />
            {result ? <ResultMeta result={result} originalSize={file.size} /> : null}
            {processing ? <LoadingIndicator label="Resizing to PAN spec…" /> : null}
            {error ? <ProcessError message={error} code={errorCode} /> : null}
            {result ? (
              <DownloadButton onClick={state.download} label="Download PAN Photo" />
            ) : null}
          </div>
        )}

        {/* Settings Area */}
        <div className="flex flex-col gap-stack-md">
          <div className="rounded-lg border border-border bg-surface-container-low p-stack-md">
            <h3 className="mb-4 flex items-center gap-2 font-label-md text-label-md text-primary">
              <Crop className="text-sm text-accent-lavender" />
              Target Dimensions
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block font-label-sm text-label-sm text-text-secondary">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={213}
                  readOnly
                  aria-label="Target width"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body-md text-primary opacity-70"
                />
              </div>
              <X className="mt-5 text-text-secondary" />
              <div className="flex-1">
                <label className="mb-1 block font-label-sm text-label-sm text-text-secondary">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={213}
                  readOnly
                  aria-label="Target height"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body-md text-primary opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-container-low p-stack-md">
            <h3 className="mb-4 flex items-center gap-2 font-label-md text-label-md text-primary">
              <HardDrive className="text-sm text-accent-lavender" />
              Output
            </h3>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Format:</span>
              <select
                value={format}
                aria-label="Output format"
                onChange={(e) => setFormat(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1 font-label-md text-label-md text-primary focus:outline-none focus:ring-2 focus:ring-accent-lavender"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-text-secondary">Result size:</span>
              <span className="font-label-md text-label-md text-primary">
                {result ? formatBytes(result.blob.size) : "—"}
              </span>
            </div>
            {result && result.blob.size > 30 * 1024 ? (
              <p className="mt-2 font-label-sm text-label-sm text-text-secondary">
                Above the 30KB guideline — try a smaller or smoother source image.
              </p>
            ) : null}
          </div>

          <div className="mt-auto pt-stack-md">
            <PanelCta
              label={processing ? "Processing…" : "Auto-Process Image"}
              icon={<Wand2 className="size-4" />}
              disabled={!file || processing}
              onClick={run}
              hint={file ? "Ready to process" : "Select an image first"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
