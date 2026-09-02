"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The shared editor-family tool panel used by the workspace pages:
 * - Desktop (>= 1024px / lg): flexible sidebar (w-80 xl:w-96) with sticky header, independent scrolling body, sticky actions.
 * - Tablet (768px - 1023px): compact sidebar (w-72 lg:w-80) with independent scrolling body.
 * - Mobile (< 768px): clean stack with optional collapsible toggle for long tools and sticky bottom action bar.
 */
export function ToolPanel({
  title,
  description,
  badge,
  children,
  footer,
  className,
  bodyClassName,
  collapsibleOnMobile = false,
  defaultCollapsedOnMobile = false,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  collapsibleOnMobile?: boolean;
  defaultCollapsedOnMobile?: boolean;
}) {
  const [mobileExpanded, setMobileExpanded] = useState(!defaultCollapsedOnMobile);

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-t border-border bg-surface md:w-72 md:border-t-0 md:border-l lg:w-80 xl:w-96",
        "flex flex-col md:h-full md:overflow-hidden",
        className
      )}
    >
      {/* Sticky Panel Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface/95 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="truncate font-headline-md text-base sm:text-lg font-bold text-primary">
              {title}
            </h3>
            {badge ? (
              <span className="rounded-md bg-accent-lavender/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-lavender">
                {badge}
              </span>
            ) : null}
          </div>

          {collapsibleOnMobile ? (
            <button
              type="button"
              onClick={() => setMobileExpanded((v) => !v)}
              className="flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-muted md:hidden"
              aria-label={mobileExpanded ? "Collapse tool settings" : "Expand tool settings"}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  mobileExpanded && "rotate-180"
                )}
              />
            </button>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>

      {/* Panel Body (Controls) */}
      <div
        className={cn(
          "flex-1 flex-col gap-5 p-4 sm:p-5 overflow-y-auto",
          collapsibleOnMobile && !mobileExpanded ? "hidden md:flex" : "flex",
          bodyClassName
        )}
      >
        {children}
      </div>

      {/* Sticky Panel Footer Actions (Always visible and accessible) */}
      {footer ? (
        <div
          className={cn(
            "sticky bottom-0 z-20 mt-auto flex gap-3 border-t border-border bg-surface/95 p-3 sm:p-4 backdrop-blur-md",
            collapsibleOnMobile && !mobileExpanded ? "hidden md:flex" : "flex"
          )}
        >
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

/**
 * Standardized ToolHeader component
 */
export function ToolHeader({
  title,
  description,
  badge,
  className,
}: {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1 text-left", className)}>
      <div className="flex items-center gap-2">
        <h2 className="font-headline-md text-xl sm:text-2xl font-bold tracking-tight text-primary">
          {title}
        </h2>
        {badge ? (
          <span className="rounded-full bg-accent-lavender/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent-lavender">
            {badge}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="text-xs sm:text-sm text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}

/**
 * Standardized SliderControl with readable values, accessible touch target, and min/max labels
 */
export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 select-none", className)}>
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <label className="font-medium text-text-secondary">{label}</label>
        <span className="rounded-md bg-surface-container-high px-2 py-0.5 font-mono font-semibold text-primary">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative flex items-center py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-thumb w-full h-2 rounded-lg bg-surface-container-high appearance-none cursor-pointer focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-outline">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

/**
 * Standardized PresetCard component for aspect ratios, sizes, angles, etc.
 */
export function PresetCard({
  label,
  value,
  selected,
  onClick,
  icon,
  badge,
  description,
  className,
}: {
  label: string;
  value?: string | number;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  badge?: string;
  description?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-value={value}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-150 min-h-[44px]",
        selected
          ? "border-accent-lavender bg-accent-lavender/10 ring-1 ring-accent-lavender"
          : "border-border bg-surface-container-low hover:border-border hover:bg-surface-container-high",
        className
      )}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-accent-lavender">{icon}</span> : null}
          <span className="font-label-md text-xs sm:text-sm font-semibold text-primary truncate">
            {label}
          </span>
        </div>
        {selected ? (
          <Check className="size-4 shrink-0 text-accent-lavender" />
        ) : badge ? (
          <span className="text-[10px] text-text-secondary">{badge}</span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-[11px] text-text-secondary truncate">{description}</p>
      ) : null}
    </button>
  );
}

/**
 * The panel footer button pair (Reset / Apply) with touch-friendly targets (min 44px)
 */
export function PanelFooterActions({
  onReset,
  applyLabel = "Apply",
  onApply,
  applyIcon,
  disabled = false,
  loading = false,
}: {
  onReset?: () => void;
  applyLabel?: string;
  onApply?: () => void;
  applyIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onReset}
        disabled={disabled || loading}
        className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded border border-[#d9dcea] bg-white px-4 py-2 text-sm font-semibold text-[#505050] transition-colors hover:bg-[#f7f8fc] active:scale-98 disabled:opacity-50"
      >
        <RotateCcw className="size-4 text-[#8a8ea6]" />
        <span>Reset</span>
      </button>
      <button
        type="button"
        onClick={onApply}
        disabled={disabled || loading}
        className="flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded bg-[#4956a5] px-4 py-2 text-sm font-bold text-white shadow transition-transform hover:bg-[#3d4890] active:scale-98 disabled:opacity-50"
      >
        {loading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          applyIcon
        )}
        <span>{loading ? "Processing..." : applyLabel}</span>
      </button>
    </>
  );
}
