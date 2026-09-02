"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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

export function SscPhotoResizerTool() {
  const [targetKb, setTargetKb] = useState(35); // SSC range 20-50KB, mid = 35KB
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    // SSC specification: 3.5cm x 4.5cm at ~100DPI = 138 x 177 px, 20-50KB
    fd.append("width", "138");
    fd.append("height", "177");
    fd.append("fit", "cover");
    fd.append("format", "jpeg");
    fd.append("targetSize", String(targetKb * 1024));
    await state.run("/api/resize", fd, DEFAULT_TIMEOUTS.mediumMs);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Photo for SSC"
            description="Automatic 3.5cm x 4.5cm sizing with 20KB-50KB target"
            buttonLabel="Select Photo"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <h4 className="mb-3 text-sm font-bold text-[#2b2f52]">
              SSC Form Sizing Preview
            </h4>
            <BeforeAfter
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              beforeLabel="Original"
              resultLabel="3.5cm x 4.5cm (SSC Standard)"
            />
            {result ? (
              <ResultMeta result={result} originalSize={file.size} className="mt-3" />
            ) : null}
          </div>
        )}

        {processing ? <LoadingIndicator label="Optimizing photo to exact SSC dimensions and size..." /> : null}
        {error ? <ProcessError message={error} code={errorCode} onRetry={run} /> : null}
        {result ? (
          <DownloadButton onClick={state.download} label="Download SSC Ready Photo" />
        ) : null}
      </div>

      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          SSC Guidelines (CGL/CHSL)
        </h3>

        <div className="space-y-2 rounded bg-[#eff0fa] p-3 text-xs text-[#4449A6]">
          <p><b>Dimensions:</b> 3.5 cm (width) × 4.5 cm (height)</p>
          <p><b>File Size:</b> 20 KB to 50 KB</p>
          <p><b>Format:</b> JPEG / JPG</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-600">
            Target Size (20KB - 50KB)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={20}
              max={50}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value) || 35)}
              className="w-full rounded border border-gray-300 p-2 text-sm font-bold outline-none focus:border-[#4449A6]"
            />
            <span className="text-xs font-bold text-gray-500">KB</span>
          </div>
        </div>

        <PanelCta
          label={processing ? "Processing..." : "Resize For SSC"}
          icon={<Check className="size-4" />}
          hint="Compliant with SSC CGL, CHSL, MTS & GD"
          disabled={!file || processing}
          onClick={run}
        />
      </div>
    </div>
  );
}
