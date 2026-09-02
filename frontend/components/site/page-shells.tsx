import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

/**
 * Shell for the "landing-style" tool pages (compress, resize, crop,
 * watermark, image-to-pdf, ai-enhance, ...): sticky header, centered
 * container main with vertical rhythm, footer pushed to the bottom.
 */
export function LandingShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background font-body-md text-body-md text-on-surface">
      <SiteHeader />
      <main
        className={
          mainClassName ??
          "mx-auto w-full max-w-container-max flex-grow space-y-stack-lg px-4 py-stack-md sm:px-6 md:px-gutter md:py-stack-lg"
        }
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/**
 * Shell for the "editor workspace" tool pages (flip, rotate, add-text,
 * square, circle, grayscale, instagram, whatsapp-dp, passport, ...):
 * - Mobile (< 768px): clean vertical document flow, no scroll traps,
 *   full-width canvas, scrollable controls, sticky bottom action bar.
 * - Tablet & Desktop (>= 768px): fixed 100dvh studio layout with collapsible
 *   studio sidebar, flexible center canvas, and dedicated tool panel.
 */
export function WorkspaceShell({
  children,
  sidebar,
  showFooter = false,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background font-body-md text-body-md text-on-surface md:h-[100dvh] md:overflow-hidden">
      <SiteHeader />
      <div className="relative flex flex-1 flex-col overflow-x-hidden md:flex-row md:overflow-hidden">
        {sidebar}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-x-hidden md:overflow-hidden">
          {children}
        </main>
      </div>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
