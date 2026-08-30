"use client";

/**
 * Shared processing-status UI used by every wired tool page:
 *  - ProcessError  : red banner (friendly message + backend code)
 *  - AiPending     : "AI features coming soon" panel for 501 stubs
 *  - BeforeAfter   : two-up original/result preview from object URLs
 *  - ResultMeta    : size/quality/dpi chips from X-* response headers
 *  - DownloadButton: saves the result blob via <a download>
 */

import type { ReactNode } from "react";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/config";
import type { ProcessImageResult } from "@/lib/api";

export function ProcessError({
  message,
  code,
  className,
}: {
  message: string;
  code?: string | null;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-error/40 bg-error/10 p-stack-md",
        className
      )}
    >
      <p className="font-label-md text-label-md text-error">{message}</p>
      {code ? (
        <p className="font-label-sm text-label-sm text-error/70">
          Error code: {code}
        </p>
      ) : null}
    </div>
  );
}

export function AiPending({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-accent-lavender/40 bg-accent-lavender/10 p-stack-md",
        className
      )}
    >
      <Sparkles className="size-5 shrink-0 text-accent-lavender" />
      <div>
        <p className="font-label-md text-label-md text-primary">
          AI features coming soon
        </p>
        <p className="font-label-sm text-label-sm text-text-secondary">
          This enhancement is being finalized and will be available shortly.
        </p>
      </div>
    </div>
  );
}

export function LoadingIndicator({
  label = "Processing…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-surface-container p-stack-md",
        className
      )}
    >
      <span
        aria-hidden
        className="size-4 animate-spin rounded-full border-2 border-accent-lavender border-t-transparent"
      />
      <p className="font-label-md text-label-md text-text-secondary">{label}</p>
    </div>
  );
}

export function BeforeAfter({
  originalUrl,
  resultUrl,
  resultLabel = "Result",
  beforeLabel = "Original",
  className,
}: {
  originalUrl: string | null;
  resultUrl: string | null;
  beforeLabel?: string;
  resultLabel?: string;
  className?: string;
}) {
  const one = originalUrl && !resultUrl;
  return (
    <div
      className={cn(
        "grid gap-stack-sm",
        one ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      {originalUrl ? (
        <figure className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-container-lowest p-2">
          <figcaption className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-1 font-label-sm text-label-sm text-primary backdrop-blur-sm">
            {beforeLabel}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Original upload"
            className="max-h-[420px] w-auto max-w-full rounded-md object-contain"
          />
        </figure>
      ) : null}
      {resultUrl ? (
        <figure className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-container-lowest p-2">
          <figcaption className="absolute left-2 top-2 z-10 rounded bg-accent-lavender/80 px-2 py-1 font-label-sm text-label-sm text-black backdrop-blur-sm">
            {resultLabel}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="Processed result"
            className="max-h-[420px] w-auto max-w-full rounded-md object-contain"
          />
        </figure>
      ) : null}
    </div>
  );
}

export function ResultMeta({
  result,
  originalSize,
  className,
}: {
  result: ProcessImageResult;
  originalSize?: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 font-label-sm text-label-sm",
        className
      )}
    >
      {originalSize ? (
        <span className="rounded-md bg-surface-container px-2 py-1 text-text-secondary">
          Original: {formatBytes(originalSize)}
        </span>
      ) : null}
      <span className="rounded-md border border-accent-lavender/30 bg-secondary-container/20 px-2 py-1 text-accent-lavender">
        {result.filename} · {formatBytes(result.blob.size)}
      </span>
      {result.qualityUsed != null ? (
        <span className="rounded-md bg-surface-container px-2 py-1 text-text-secondary">
          Quality: {result.qualityUsed}
        </span>
      ) : null}
      {result.dpi != null ? (
        <span className="rounded-md bg-surface-container px-2 py-1 text-text-secondary">
          DPI: {result.dpi}
        </span>
      ) : null}
    </div>
  );
}

export function DownloadButton({
  onClick,
  label = "Download Result",
  disabled = false,
  className,
  icon,
}: {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-tertiary-fixed-dim disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {icon ?? <Download className="size-4" />}
      {label}
    </button>
  );
}

export function EmptyResultNotice() {
  return (
    <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
      <ImageIcon className="size-4" />
      Upload an image, adjust the settings, then run the tool.
    </div>
  );
}
