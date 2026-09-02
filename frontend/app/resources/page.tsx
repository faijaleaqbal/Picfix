import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";

export const metadata: Metadata = {
  title: "Resources & Guides",
  description: "Image processing documentation, compression guides, format comparison benchmarks, and DPI standards.",
};

const GUIDES = [
  {
    title: "Image Formats Compared: JPEG vs PNG vs WebP vs AVIF",
    category: "Compression & Formats",
    summary: "Understand when to use lossless PNG for graphics with transparency versus modern WebP and JPEG for photographic compression.",
    readTime: "4 min read",
    link: "/compress-image",
  },
  {
    title: "Demystifying DPI: Setting 300 DPI for Passports & Official IDs",
    category: "Print & Sizing",
    summary: "Why screen pixels and print DPI are different, and how Picfix enforces exact physical centimeter measurements with 300 DPI headers.",
    readTime: "3 min read",
    link: "/passport-size-photo",
  },
  {
    title: "Social Media Aspect Ratio Guide",
    category: "Creator Standards",
    summary: "Standard dimensions and safe zones for Instagram Reels, square feed posts, WhatsApp profile avatars, and YouTube thumbnails.",
    readTime: "5 min read",
    link: "/templates",
  },
];

export default function ResourcesPage() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-5xl py-8 sm:py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <BookOpen className="size-3.5" />
            Knowledge Base
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Image Guides & Best Practices
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Helpful reference guides on digital image formats, print resolution, and aspect ratio standards.
          </p>
        </div>

        {/* Security & Privacy Commitment Banner */}
        <div className="rounded-3xl border border-border bg-surface-container p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-lavender/15 text-accent-lavender">
              <ShieldCheck className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-primary">
                Ephemeral Privacy Commitment
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Picfix processes images in volatile memory buffers and temporary sandboxed storage. All files uploaded through our web application are automatically deleted after processing. We never store user photos permanently or use them to train AI models.
              </p>
            </div>
          </div>
        </div>

        {/* Guides Section */}
        <div className="space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="font-headline-md text-xl font-bold text-primary">Optimization Guides</h2>
            <p className="text-xs text-text-secondary">Practical reference guides for creators and everyday users.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES.map((guide, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface-container-low p-6 transition-all hover:border-accent-lavender"
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-accent-lavender">
                    {guide.category} · {guide.readTime}
                  </span>
                  <h3 className="font-headline-md text-sm font-bold text-primary leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border">
                  <Link
                    href={guide.link}
                    className="flex items-center gap-1.5 text-xs font-semibold text-accent-lavender hover:underline"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingShell>
  );
}
