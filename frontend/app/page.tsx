import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowRight, Zap, ShieldCheck, Gauge } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TOOLS, TOOL_GROUPS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "LuminaEdit AI — Free Online Image Editing Tools",
  description:
    "Professional grade image processing tools for modern workflows. Compress, resize, crop, convert and enhance images — free, private and fast.",
};

/**
 * Landing page: hero + full tool directory grouped by category.
 * Every tool in lib/tools.ts is linked from here (see verification).
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-body-md text-on-surface">
      <SiteHeader />

      <main className="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter md:py-16">
        {/* Hero */}
        <section className="mx-auto mb-stack-lg max-w-3xl space-y-stack-md text-center md:mb-24">
          <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 font-label-sm text-label-sm text-accent-lavender">
            <Sparkles className="size-4" />
            Powered by LuminaEdit AI
          </span>
          <h1 className="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">
            Professional image tools for modern workflows
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-text-secondary">
            Compress, resize, crop, convert and enhance images — free,
            private and fast. All 21 tools run right in your browser.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-stack-md">
            <Link
              href="/compress-image"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-tertiary-fixed-dim"
            >
              Start Editing
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/ai-enhance-image"
              className="flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
            >
              <Sparkles className="size-4 text-accent-lavender" />
              Try AI Enhance
            </Link>
          </div>
        </section>

        {/* Value props */}
        <section className="mb-stack-lg grid grid-cols-1 gap-stack-md md:mb-24 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-stack-md">
            <div className="rounded-lg bg-surface-container-high p-2 text-accent-lavender">
              <Zap className="size-5" />
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-primary">
                Instant Processing
              </h3>
              <p className="font-label-sm text-label-sm text-text-secondary">
                Files are processed locally in your browser. No uploads required.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-stack-md">
            <div className="rounded-lg bg-surface-container-high p-2 text-accent-lavender">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-primary">
                Private by Default
              </h3>
              <p className="font-label-sm text-label-sm text-text-secondary">
                Your images are never uploaded to our servers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-stack-md">
            <div className="rounded-lg bg-surface-container-high p-2 text-accent-lavender">
              <Gauge className="size-5" />
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-primary">
                Pro-Grade Quality
              </h3>
              <p className="font-label-sm text-label-sm text-text-secondary">
                Advanced interpolation algorithms keep output pristine.
              </p>
            </div>
          </div>
        </section>

        {/* Tool directory */}
        {TOOL_GROUPS.map((group) => (
          <section key={group.id} className="mb-stack-lg">
            <h2 className="font-headline-md text-headline-md mb-stack-md text-primary">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.filter((tool) => tool.group === group.id).map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${tool.slug}`}
                  className="group flex flex-col items-start gap-stack-sm rounded-xl border border-border bg-surface p-stack-md transition-colors hover:border-accent-lavender"
                >
                  <div className="rounded-lg bg-surface-container-high p-2 text-primary transition-colors group-hover:text-accent-lavender">
                    <tool.icon className="size-5" />
                  </div>
                  <h3 className="font-label-md text-label-md text-primary">
                    {tool.title}
                  </h3>
                  <p className="font-body-md text-body-md text-sm text-text-secondary">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Resize special-routes note */}
        <section className="mb-stack-lg">
          <h2 className="font-headline-md text-headline-md mb-stack-md text-primary">
            Popular quick links
          </h2>
          <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/resize-image-pixel"
              className="group flex flex-col items-start gap-stack-sm rounded-xl border border-border bg-surface p-stack-md transition-colors hover:border-accent-lavender"
            >
              <div className="rounded-lg bg-surface-container-high p-2 text-primary transition-colors group-hover:text-accent-lavender">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-label-md text-label-md text-primary">
                Resize Image (px)
              </h3>
              <p className="font-body-md text-body-md text-sm text-text-secondary">
                Change image dimensions in pixels.
              </p>
            </Link>
            <Link
              href="/resize-image-in-cm"
              className="group flex flex-col items-start gap-stack-sm rounded-xl border border-border bg-surface p-stack-md transition-colors hover:border-accent-lavender"
            >
              <div className="rounded-lg bg-surface-container-high p-2 text-primary transition-colors group-hover:text-accent-lavender">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-label-md text-label-md text-primary">
                Resize Image (cm)
              </h3>
              <p className="font-body-md text-body-md text-sm text-text-secondary">
                Change image dimensions in centimeters.
              </p>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
