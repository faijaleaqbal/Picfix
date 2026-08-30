import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Shared page-section primitives extracted from the Stitch exports.

   Every landing-family tool page repeats the same handful of blocks:
   a hero header, an upload drop zone, a settings panel, an FAQ grid,
   a related-tools grid and feature cards. They live here so the 21
   route files stay faithful to their source without 21 copies of the
   same markup.
   ------------------------------------------------------------------ */

/**
 * Centered hero header that opens a landing-family tool page
 * (headline + sub-copy), matching the exports' "Header Section".
 */
export function ToolHero({
  headline,
  description,
  className,
}: {
  headline: string;
  description: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto max-w-2xl space-y-stack-sm text-center",
        className
      )}
    >
      <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">
        {headline}
      </h1>
      <p className="font-body-lg text-body-lg text-text-secondary">
        {description}
      </p>
    </section>
  );
}

/**
 * The always-open Q/A cards the exports use for "Frequently Asked
 * Questions" (compress, crop, watermark). Rendered as a grid, not an
 * accordion, to stay faithful to the sources.
 */
export function FaqSection({
  items,
  title = "Frequently Asked Questions",
  centered = false,
  containerClassName = "bg-surface-container border border-border",
  className,
}: {
  items: { q: string; a: string }[];
  title?: string;
  centered?: boolean;
  containerClassName?: string;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-border py-stack-lg", className)}>
      <h2
        className={cn(
          "font-headline-md text-headline-md text-primary",
          centered ? "mb-stack-md text-center" : "mb-stack-md"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "grid grid-cols-1 gap-stack-md md:grid-cols-2",
          centered ? "mx-auto max-w-4xl" : ""
        )}
      >
        {items.map((item) => (
          <div key={item.q} className={cn("rounded-xl p-stack-md", containerClassName)}>
            <h3 className="font-label-md text-label-md mb-2 font-semibold text-primary">
              {item.q}
            </h3>
            <p className="font-body-md text-body-md text-sm text-text-secondary">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Info/feature grid used by the conversion-family pages
 * (JPEG to JPG: Instant Processing + Batch Conversion).
 */
export function FeatureCards({
  items,
  className,
}: {
  items: { icon: ReactNode; title: string; body: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-2",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-4 rounded-xl border border-border bg-surface-container-lowest p-stack-md"
        >
          <div className="rounded-lg bg-surface-container-high p-2 text-accent-lavender">
            {item.icon}
          </div>
          <div>
            <h4 className="font-label-md text-label-md mb-1 text-primary">
              {item.title}
            </h4>
            <p className="font-label-sm text-label-sm text-text-secondary">
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Settings-panel section header used by the right-hand tool panels
 * ("Compression Settings", "Enhancement Settings", ...).
 */
export function PanelHeader({
  title,
  icon,
  className,
}: {
  title: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "flex items-center gap-2 border-b border-border pb-stack-sm font-headline-md text-headline-md text-primary",
        className
      )}
    >
      {icon}
      {title}
    </h3>
  );
}

/**
 * Lavender range slider as used across the exports' settings panels.
 * Native input + shared .slider-thumb styles from globals.css.
 */
export function RangeSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  valueClassName = "font-label-sm text-label-sm text-primary",
  labelClassName = "font-label-sm text-label-sm text-text-secondary",
  wrapClassName,
  disabled = false,
  "aria-label": ariaLabel,
}: {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  valueClassName?: string;
  labelClassName?: string;
  wrapClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("space-y-stack-sm", wrapClassName)}>
      {label ? (
        <div className="flex items-center justify-between">
          <span className={labelClassName}>{label}</span>
          <span className={valueClassName}>{value}</span>
        </div>
      ) : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel ?? label ?? "range"}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="slider-thumb w-full"
      />
    </div>
  );
}

