import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Code2,
} from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";

export const metadata: Metadata = {
  title: "Resources & Guides",
  description: "Image processing documentation, compression guides, format comparison benchmarks, and developer API references.",
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
    title: "Social Media Aspect Ratio Guide (2025-2026)",
    category: "Creator Best Practices",
    summary: "Cheat sheet of exact dimensions and safe zones for Instagram Reels, Stories, WhatsApp avatars, and YouTube banners.",
    readTime: "5 min read",
    link: "/templates",
  },
];

const API_ENDPOINTS = [
  {
    endpoint: "POST /api/compress",
    description: "Iterative quality binary search engine to hit exact target kilobyte thresholds.",
    params: "image (File), targetSize (bytes), format (jpeg|webp)",
  },
  {
    endpoint: "POST /api/crop",
    description: "Lossless geometric bounding-box and circular alpha mask crop.",
    params: "image (File), shape (circle|square), x, y, width, height",
  },
  {
    endpoint: "POST /api/social-resize",
    description: "Preset cover-fit center crop for Instagram, WhatsApp DP, PAN card, and Passports.",
    params: "image (File), platform, format, quality",
  },
  {
    endpoint: "POST /api/watermark",
    description: "High-speed text and logo watermark composite with custom opacity and margin.",
    params: "image (File), text, fontSize, color, position, opacity",
  },
];

export default function ResourcesPage() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-5xl py-8 sm:py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <BookOpen className="size-3.5" />
            Knowledge Base & API Docs
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Picfix Engineering & Guides
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Deep dive into technical image processing standards, DPI calculations, format comparisons, and headless REST API documentation.
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
                Picfix processes images in volatile memory buffers and temporary sandboxed volumes. All files uploaded through our web application or APIs are automatically destroyed after processing. We never train AI models on user photos or store private images.
              </p>
            </div>
          </div>
        </div>

        {/* Guides Section */}
        <div className="space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="font-headline-md text-xl font-bold text-primary">Optimization Guides</h2>
            <p className="text-xs text-text-secondary">Actionable reference guides for digital creators and web developers.</p>
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

        {/* API Reference Preview */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="font-headline-md text-xl font-bold text-primary">Headless REST API Reference</h2>
              <p className="text-xs text-text-secondary">Integrate Picfix high-performance image processing into your applications.</p>
            </div>
            <span className="w-fit rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-accent-lavender">
              Base: https://picfix.duckdns.org
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {API_ENDPOINTS.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-surface-container-high px-2.5 py-1 rounded-lg">
                    {item.endpoint}
                  </span>
                  <span className="rounded bg-accent-lavender/10 px-2 py-0.5 text-[10px] font-semibold text-accent-lavender">
                    multipart/form-data
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.description}
                </p>
                <div className="text-[11px] font-mono text-outline">
                  <span className="font-semibold text-text-secondary">Params: </span>{item.params}
                </div>
              </div>
            ))}
          </div>

          {/* Code example */}
          <div className="rounded-2xl border border-border bg-surface-container-lowest p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-2 font-mono font-semibold text-primary">
                <Code2 className="size-4 text-accent-lavender" />
                Example: cURL Image Compression
              </span>
              <span className="font-mono text-[11px]">bash</span>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-black/80 p-4 font-mono text-xs text-zinc-300 leading-relaxed">
{`curl -X POST https://picfix.duckdns.org/api/compress \\
  -F "image=@photo.jpg" \\
  -F "targetSize=204800" \\
  -F "format=jpeg" \\
  --output photo_compressed.jpg`}
            </pre>
          </div>
        </div>
      </div>
    </LandingShell>
  );
}
