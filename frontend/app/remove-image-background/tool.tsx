"use client";

import { Scissors, Check } from "lucide-react";
import { UploadDropzone } from "@/components/site/upload-dropzone";
import { PanelCta } from "@/components/site/panel-cta";
import {
  AiPending,
  BeforeAfter,
  DownloadButton,
  LoadingIndicator,
  ProcessError,
} from "@/components/site/process-result";
import { useProcessing } from "@/lib/use-processing";

export function RemoveBackgroundTool() {
  const state = useProcessing();
  const { file, result, resultUrl, originalUrl, processing, error, errorCode } = state;

  const run = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    await state.runAi("/api/ai/remove-background", fd, 60000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Upload & Preview */}
      <div className="flex flex-col gap-4 lg:col-span-8">
        {!file ? (
          <UploadDropzone
            title="Select Or Drag & Drop Images Here"
            description="Upload a photo to automatically remove background with AI"
            buttonLabel="Select Image"
            size="lg"
            onFileSelected={state.selectFile}
            selectedName={state.file?.name ?? null}
          />
        ) : (
          <div className="rounded-md border border-[#d9dcea] bg-white p-4">
            <h4 className="mb-3 text-sm font-bold text-[#2b2f52]">
              Background Removal Preview
            </h4>
            <BeforeAfter
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              beforeLabel="Original"
              resultLabel="Transparent PNG"
            />
          </div>
        )}

        {processing ? (
          <LoadingIndicator label="AI is detecting subject and isolating background..." />
        ) : null}
        {error && !state.aiPending ? (
          <ProcessError message={error} code={errorCode} onRetry={run} />
        ) : null}
        {state.aiPending ? <AiPending /> : null}
        {result ? (
          <DownloadButton onClick={state.download} label="Download Transparent PNG" />
        ) : null}
      </div>

      {/* Settings / Action Sidebar */}
      <div className="sticky top-20 flex h-fit flex-col gap-4 rounded-md border border-[#d9dcea] bg-white p-5 lg:col-span-4">
        <h3 className="border-b border-[#e3e4ef] pb-3 text-base font-bold text-[#2b2f52]">
          Remove Background
        </h3>
        <p className="text-xs leading-relaxed text-[#6e7288]">
          Our deep learning AI automatically detects humans, animals, vehicles, and products to remove the background with transparent alpha cutouts.
        </p>

        <div className="rounded bg-[#eff0fa] p-3 text-xs text-[#4449A6]">
          <b>Output:</b> High resolution PNG with transparent background.
        </div>

        <PanelCta
          label={processing ? "Processing AI..." : "Remove Background"}
          icon={processing ? <Scissors className="size-4 animate-spin" /> : <Check className="size-4" />}
          hint="Fast AI segmentation in seconds"
          disabled={!file || processing}
          onClick={run}
        />
      </div>
    </div>
  );
}
