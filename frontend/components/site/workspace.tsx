"use client";

import { useState, type ReactNode } from "react";
import { CloudUpload, Undo2, Redo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Shared client-side workspace primitives used by the editor-style
   tool pages. Mock interactions only — nothing is uploaded or sent
   to a backend; state toggles drive the visuals.
   ------------------------------------------------------------------ */

/**
 * Generic image slot. Every Stitch export points at an external
 * placeholder photo (lh3.googleusercontent.com "aida-public" URLs)
 * that is neither self-hosted nor reliable, so the canvas surfaces
 * render a deterministic SVG placeholder instead. The `caption`
 * mirrors the descriptive alt text the source attached to the image.
 */
export function CanvasImage({
  className,
  caption,
  seed = 1,
  rounded = "rounded-xl",
  label,
}: {
  className?: string;
  caption?: string;
  seed?: number;
  rounded?: string;
  label?: string;
}) {
  const hue = (seed * 47) % 360;
  return (
    <div
      role="img"
      aria-label={caption ?? "Image placeholder"}
      className={cn(
        "relative flex items-center justify-center overflow-hidden border border-border",
        rounded,
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 18% 16%) 0%, hsl(${
          (hue + 40) % 360
        } 22% 24%) 100%)`,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 240 160"
        className="absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx={40 + (seed % 60)} cy={40 + (seed % 30)} r="48" fill={`hsl(${hue} 30% 30% / 0.5)`} />
        <circle cx={200 - (seed % 50)} cy={130 - (seed % 40)} r="60" fill={`hsl(${(hue + 60) % 360} 25% 28% / 0.45)`} />
        <rect x="0" y="0" width="240" height="160" fill="none" stroke={`hsl(${hue} 40% 70% / 0.25)`} strokeWidth="0.5" />
      </svg>
      {label ? (
        <span className="relative z-10 rounded bg-black/60 px-2 py-1 font-label-sm text-label-sm text-primary backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Mock upload zone that toggles into a "canvas" state when clicked,
 * mirroring the click-to-browse interaction of the exports. Accepts
 * the panel shown in the active state so each page keeps its own
 * settings surface.
 */
export function MockUploadCanvas({
  idleTitle = "Drag & Drop Image Here",
  idleDescription = "or click to browse from your device",
  buttonLabel = "Select Image",
  hint,
  caption,
  seed,
  children,
  className,
}: {
  idleTitle?: string;
  idleDescription?: string;
  buttonLabel?: string;
  hint?: string;
  caption?: string;
  seed?: number;
  children?: ReactNode;
  className?: string;
}) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className={cn("flex flex-col gap-stack-md", className)}>
      {!uploaded ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setUploaded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setUploaded(true);
          }}
          aria-label="Upload image"
          className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-stack-lg text-center transition-colors hover:border-accent-lavender"
        >
          <CloudUpload className="mb-stack-sm size-10 text-text-secondary transition-colors group-hover:text-accent-lavender" />
          <h3 className="font-headline-md text-headline-md mb-2 text-primary">
            {idleTitle}
          </h3>
          <p className="mb-stack-md font-body-md text-body-md text-text-secondary">
            {idleDescription}
          </p>
          <button
            type="button"
            className="rounded-full border border-border bg-surface-variant px-6 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
          >
            {buttonLabel}
          </button>
          {hint ? (
            <p className="mt-stack-md font-label-sm text-label-sm text-text-secondary">
              {hint}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {children ?? (
            <CanvasImage caption={caption} seed={seed} className="min-h-[300px] w-full" />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Floating zoom/undo/redo pill that overlays several editor canvases
/**
 * Floating zoom/undo/redo pill that overlays several editor canvases.
 * Designed to fit gracefully on both mobile (< 640px) and desktop viewports without collision.
 */
export function CanvasToolbar({
  zoom = "100%",
  className,
  position = "bottom-4 sm:bottom-6",
}: {
  zoom?: string;
  className?: string;
  position?: string;
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  return (
    <div
      aria-label="Canvas toolbar"
      className={cn(
        "absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 sm:gap-2 rounded-full border border-border bg-surface-container-high/90 px-2 py-1 shadow-lg backdrop-blur-md max-w-[calc(100%-2rem)]",
        position,
        className
      )}
    >
      <button
        type="button"
        aria-label="Undo"
        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-muted hover:text-primary active:scale-95"
      >
        <Undo2 className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Redo"
        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-muted hover:text-primary active:scale-95"
      >
        <Redo2 className="size-4" />
      </button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-muted hover:text-primary active:scale-95"
      >
        <ZoomOut className="size-4" />
      </button>
      <span className="w-10 text-center font-mono text-xs font-semibold text-primary">
        {zoom === "Fit" ? "Fit" : `${zoomLevel}%`}
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => setZoomLevel((z) => Math.min(400, z + 25))}
        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-muted hover:text-primary active:scale-95"
      >
        <ZoomIn className="size-4" />
      </button>
    </div>
  );
}

/**
 * Responsive Editor Toolbar addressing Part 6:
 * Desktop: Title                         Undo Redo Apply
 * Mobile:
 *   Title
 *   Undo Redo                            Apply
 */
export function EditorToolbar({
  title,
  badge,
  onUndo,
  onRedo,
  onApply,
  applyLabel = "Apply",
  applyLoading = false,
  className,
}: {
  title: string;
  badge?: string;
  onUndo?: () => void;
  onRedo?: () => void;
  onApply?: () => void;
  applyLabel?: string;
  applyLoading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 border-b border-border bg-surface/90 px-4 py-2.5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-headline-md text-base sm:text-lg font-bold text-primary truncate">
          {title}
        </h2>
        {badge ? (
          <span className="rounded bg-accent-lavender/20 px-2 py-0.5 font-mono text-[10px] text-accent-lavender">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface-container-low p-0.5">
          <button
            type="button"
            onClick={onUndo}
            aria-label="Undo action"
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-muted hover:text-primary"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            aria-label="Redo action"
            className="flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-muted hover:text-primary"
          >
            <Redo2 className="size-4" />
          </button>
        </div>

        {onApply ? (
          <button
            type="button"
            onClick={onApply}
            disabled={applyLoading}
            className="flex min-h-[38px] items-center justify-center rounded-full bg-primary px-4 py-1.5 font-label-md text-xs sm:text-sm font-semibold text-on-primary shadow-sm transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {applyLoading ? "Applying..." : applyLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Working peer-checked toggle switch (the exports ship the same
 * w-9/h-5 pill). Controlled by local state.
 */
export function ToggleSwitch({
  defaultChecked = false,
  label,
  className,
  scale = "sm",
  onChange,
}: {
  defaultChecked?: boolean;
  label: string;
  className?: string;
  scale?: "sm" | "md";
  onChange?: (checked: boolean) => void;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const size = scale === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = scale === "sm" ? "h-4 w-4" : "h-5 w-5";
  const shift = scale === "sm" ? "translate-x-4" : "translate-x-5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        setChecked((c) => {
          const next = !c;
          onChange?.(next);
          return next;
        });
      }}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-lavender focus:ring-offset-2 focus:ring-offset-background",
        size,
        checked ? "bg-accent-lavender" : "bg-surface-container-high",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          knob,
          checked ? shift : "translate-x-0"
        )}
      />
    </button>
  );
}

/**
 * The w-3/h-3 grid position picker used by watermark + logo pages
 * (9 positions, one selected).
 */
export function PositionGrid({
  value,
  onChange,
  size = "w-8 h-8",
  className,
}: {
  value: number;
  onChange: (index: number) => void;
  size?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid w-32 grid-cols-3 gap-2", className)}>
      {Array.from({ length: 9 }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Position ${i + 1}`}
          onClick={() => onChange(i)}
          className={cn(
            "flex items-center justify-center rounded border transition-colors",
            size,
            value === i
              ? "border-accent-lavender bg-surface-container-high ring-1 ring-accent-lavender"
              : "border-border bg-muted hover:bg-surface-container-high"
          )}
        >
          {value === i ? (
            <span className="h-2 w-2 rounded-full bg-accent-lavender" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * The row-of-radio swatches used by circle crop / PNG-to-JPEG for
 * background + border colors.
 */
export function ColorSwatches({
  colors,
  value,
  onChange,
  size = "size-8",
  className,
}: {
  colors: { name: string; className: string }[];
  value: string;
  onChange: (name: string) => void;
  size?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      {colors.map((color) => (
        <button
          key={color.name}
          type="button"
          title={color.name}
          aria-label={color.name}
          onClick={() => onChange(color.name)}
          className={cn(
            "shrink-0 rounded-full border border-border transition-transform hover:scale-110",
            size,
            color.className,
            value === color.name && "ring-2 ring-accent-lavender ring-offset-2 ring-offset-surface"
          )}
        />
      ))}
    </div>
  );
}
