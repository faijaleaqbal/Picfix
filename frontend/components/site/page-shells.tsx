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
    <div className="flex min-h-screen flex-col bg-background font-body-md text-body-md text-on-surface">
      <SiteHeader />
      <main
        className={
          mainClassName ??
          "mx-auto w-full max-w-container-max flex-grow space-y-stack-lg px-margin-mobile py-stack-lg md:px-gutter"
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
 * sticky header, then a full-height row with the Workbench sidebar,
 * the canvas area, and (optionally) a right tool panel.
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
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-md text-body-md text-on-surface">
      <SiteHeader />
      <div className="relative flex flex-1 overflow-hidden">
        {sidebar}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
