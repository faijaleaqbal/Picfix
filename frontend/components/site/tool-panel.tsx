"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The shared editor-family tool panel used by the workspace pages
 * (square, circle, rotate, flip, add-text, add-logo, grayscale,
 * instagram, whatsapp-dp): a w-80 surface column with a sticky
 * "headline + description" header, a scrolling settings body and a
 * sticky footer for Reset/Apply. Mock only.
 */
export function ToolPanel({
  title,
  description,
  children,
  footer,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-l border-border bg-surface md:w-80 lg:flex",
        className
      )}
    >
      <div className="sticky top-0 z-10 border-b border-border bg-surface/95 p-stack-md backdrop-blur">
        <h3 className="font-headline-md text-headline-md font-semibold text-primary">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 font-body-sm text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col gap-stack-lg p-stack-md", bodyClassName)}>
        {children}
      </div>
      {footer ? (
        <div className="sticky bottom-0 mt-auto flex gap-stack-sm border-t border-border bg-surface p-stack-md">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

/**
 * The panel footer button pair (Reset / Apply) from the exports.
 */
export function PanelFooterActions({
  onReset,
  applyLabel = "Apply",
  onApply,
  applyIcon,
}: {
  onReset?: () => void;
  applyLabel?: string;
  onApply?: () => void;
  applyIcon?: ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onReset}
        className="flex-1 rounded-full border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
      >
        {applyIcon}
        {applyLabel}
      </button>
    </>
  );
}
