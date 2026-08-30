"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Settings-panel CTA used by the landing-family tool pages
 * ("Compress Image", "Convert Image", ...). Mock only — onClick may
 * toggle local UI state but never calls a backend.
 */
export function PanelCta({
  label,
  onClick,
  variant = "primary",
  hint,
  disabled = false,
  icon,
  className,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "accent" | "ghost";
  hint?: string;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-auto border-t border-border pt-stack-sm", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full py-3 font-label-md text-label-md transition-colors",
          variant === "primary" &&
            "bg-primary text-on-primary hover:bg-tertiary-fixed-dim",
          variant === "accent" &&
            "bg-accent-lavender text-on-primary shadow-lg shadow-accent-lavender/20 hover:bg-secondary",
          variant === "ghost" &&
            "border border-outline-variant text-primary hover:bg-muted",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {icon}
        {label}
      </button>
      {hint ? (
        <p className="mt-2 text-center font-label-sm text-label-sm text-outline">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
