import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Camera,
  UserCheck,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Tv,
  Smartphone,
} from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";

export const metadata: Metadata = {
  title: "Templates & Presets",
  description: "Pre-configured canvas dimensions, aspect ratios, and official sizing templates for social platforms, passports, and online stores.",
};

const TEMPLATE_CATEGORIES = [
  {
    category: "Social Media & Creators",
    description: "Pixel-perfect aspect ratios designed to prevent unwanted cropping on feeds.",
    templates: [
      {
        name: "Instagram Square Post",
        dims: "1080 × 1080 px",
        ratio: "1:1",
        icon: Camera,
        toolHref: "/resize-image-for-instagram",
        note: "Universal square post format for standard Instagram feeds.",
      },
      {
        name: "Instagram Story & Reel",
        dims: "1080 × 1920 px",
        ratio: "9:16",
        icon: Smartphone,
        toolHref: "/resize-image-for-instagram",
        note: "Full vertical screen format for Stories and Reels.",
      },
      {
        name: "WhatsApp Profile Picture",
        dims: "500 × 500 px",
        ratio: "1:1",
        icon: MessageCircle,
        toolHref: "/resize-image-for-whatsapp-dp",
        note: "Circular avatar mask alignment with zero stretching.",
      },
      {
        name: "YouTube Thumbnail",
        dims: "1280 × 720 px",
        ratio: "16:9",
        icon: Tv,
        toolHref: "/resize-image-pixel",
        note: "High-definition standard 16:9 widescreen canvas.",
      },
    ],
  },
  {
    category: "Official Documents & ID Cards",
    description: "Standard government, visa, and passport photo dimensions with exact centimeter measurements.",
    templates: [
      {
        name: "Passport Size Photo",
        dims: "3.5 × 4.5 cm (300 DPI)",
        ratio: "7:9",
        icon: UserCheck,
        toolHref: "/passport-size-photo",
        note: "Standard biometric international passport photo specification.",
      },
      {
        name: "Indian PAN Card Photo",
        dims: "2.5 × 3.5 cm (213 × 213 px)",
        ratio: "Custom",
        icon: CreditCard,
        toolHref: "/resize-for-pan-card",
        note: "Strict NSDL / UTIITSL official upload compliance specs.",
      },
      {
        name: "US Visa & Passport",
        dims: "2 × 2 inches (600 × 600 px)",
        ratio: "1:1",
        icon: UserCheck,
        toolHref: "/square-image-cropper",
        note: "Exact 2x2 inch square format for DS-160 and visa applications.",
      },
    ],
  },
  {
    category: "E-Commerce & Digital Storefronts",
    description: "Clean product showcase templates optimized for marketplace conversion.",
    templates: [
      {
        name: "Square Product Showcase",
        dims: "1200 × 1200 px",
        ratio: "1:1",
        icon: ShoppingBag,
        toolHref: "/square-image-cropper",
        note: "Standard marketplace listing for Amazon, Shopify, and eBay.",
      },
      {
        name: "Circular Brand Stamp",
        dims: "800 × 800 px (PNG)",
        ratio: "Circle",
        icon: Layers,
        toolHref: "/circle-crop",
        note: "Transparent circular cutout for brand stickers and logos.",
      },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-5xl py-8 sm:py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <Layers className="size-3.5" />
            Template Directory
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Instant Canvas Templates
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Select a verified dimension template below to launch the editor with exact pixel and aspect ratio specifications.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {TEMPLATE_CATEGORIES.map((cat, i) => (
            <div key={i} className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="font-headline-md text-xl font-bold text-primary">{cat.category}</h2>
                <p className="text-xs text-text-secondary">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.templates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.name}
                      className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-container-low p-5 transition-all hover:border-accent-lavender hover:bg-surface-container"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container-high text-accent-lavender transition-transform group-hover:scale-105">
                            <Icon className="size-5" />
                          </div>
                          <span className="rounded-md border border-accent-lavender/30 bg-accent-lavender/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent-lavender">
                            {tpl.ratio}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-label-md text-sm font-bold text-primary">
                            {tpl.name}
                          </h3>
                          <p className="font-mono text-xs text-accent-lavender mt-0.5">
                            {tpl.dims}
                          </p>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed">
                          {tpl.note}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-border/60">
                        <Link
                          href={tpl.toolHref}
                          className="flex min-h-[38px] items-center justify-between text-xs font-semibold text-primary hover:text-accent-lavender transition-colors"
                        >
                          <span>Open in Editor</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 text-accent-lavender" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LandingShell>
  );
}
