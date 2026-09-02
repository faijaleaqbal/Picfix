import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Zap, HelpCircle, ArrowRight } from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Simple, transparent pricing. Use Picfix free online tools or upgrade for unlimited high-speed AI workflows.",
};

const TIERS = [
  {
    name: "Free Forever",
    badge: "Current Plan",
    price: "$0",
    period: "forever",
    description: "Full access to all 21 core image editing and resizing tools without credit card.",
    features: [
      "All 21 image transformation tools",
      "Up to 15 MB file upload limit",
      "High-speed server processing",
      "Standard format support (JPG, PNG, WebP, GIF, SVG, AVIF, HEIC)",
      "Zero registration required",
      "Privacy-first: files purged automatically",
    ],
    cta: "Start Editing Free",
    href: "/",
    highlighted: false,
  },
  {
    name: "Picfix Pro",
    badge: "Early Access",
    price: "$9",
    period: "per month",
    description: "Designed for photographers, social media managers, and power creators.",
    features: [
      "Everything in Free, plus:",
      "Priority GPU AI Enhancement pipeline",
      "Batch image processing (up to 50 files simultaneously)",
      "Higher 50 MB per-file upload ceiling",
      "Saved watermark and logo presets",
      "Ad-free workspace and faster queue priority",
    ],
    cta: "Join Pro Waitlist",
    href: "#waitlist",
    highlighted: true,
  },
  {
    name: "API & Enterprise",
    badge: "Custom",
    price: "Custom",
    period: "flexible billing",
    description: "Self-hosted Docker containers, dedicated Redis/BullMQ queues, and custom SLAs.",
    features: [
      "Headless REST API access with API keys",
      "Webhook notifications on job completion",
      "Dedicated worker concurrency & isolated containers",
      "99.9% uptime SLA guarantee",
      "Custom retention and compliance policies",
      "Dedicated engineering support",
    ],
    cta: "Contact Enterprise",
    href: "mailto:support@picfix.duckdns.org",
    highlighted: false,
  },
];

const FAQS = [
  {
    q: "Is Picfix really 100% free?",
    a: "Yes! All standard image editing tools—compression, cropping, rotation, watermarking, social resizing, and format conversions—are completely free with no watermark added to your output.",
  },
  {
    q: "What is the file upload size limit?",
    a: "Free accounts can process images up to 15 MB per file. This limit is enforced directly on our high-performance backend pipelines.",
  },
  {
    q: "Are my uploaded photos stored on your servers?",
    a: "No. Picfix operates on strict ephemeral processing. Files are processed in secure memory buffers or temporary sandbox storage and automatically purged immediately after download.",
  },
  {
    q: "When will Picfix Pro AI features launch?",
    a: "Our deep-learning AI models for super-resolution and background segmentation are currently in beta testing. Join the waitlist below to get notified with early-bird perks!",
  },
];

export default function PricingPage() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-5xl py-8 sm:py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <Sparkles className="size-3.5" />
            Transparent Pricing
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Simple tools. Serious speed.
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Use all standard editing tools completely free. Upgrade when you need high-volume batch processing and dedicated AI queues.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 transition-all ${
                tier.highlighted
                  ? "border-accent-lavender bg-surface-container-high/60 shadow-xl ring-2 ring-accent-lavender/40"
                  : "border-border bg-surface-container-low"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-headline-md text-lg font-bold text-primary">{tier.name}</h3>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-accent-lavender border border-border">
                    {tier.badge}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary">
                    {tier.price}
                  </span>
                  <span className="text-xs text-text-secondary">/{tier.period}</span>
                </div>

                <p className="mt-3 text-xs text-text-secondary">{tier.description}</p>

                <div className="my-6 border-t border-border" />

                <ul className="space-y-2.5 text-xs text-text-secondary">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 text-accent-lavender mt-0.5" />
                      <span className={feature.startsWith("Everything") ? "font-semibold text-primary" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={tier.href}
                  className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    tier.highlighted
                      ? "bg-accent-lavender text-black shadow-md hover:bg-accent-lavender/90 font-bold"
                      : "border border-border bg-surface text-primary hover:bg-muted"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist Section */}
        <div id="waitlist" className="mt-16 rounded-3xl border border-border bg-surface-container p-6 sm:p-10 text-center">
          <div className="mx-auto max-w-lg space-y-3">
            <Zap className="mx-auto size-8 text-accent-lavender" />
            <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
              Get Early Access to Picfix Pro
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              Be the first to test our next-gen GPU upscaler, automatic background remover, and multi-file batch editor.
            </p>
            <form
              action="#"
              className="mt-6 flex flex-col sm:flex-row items-center gap-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-xs text-primary placeholder:text-text-secondary focus:border-accent-lavender focus:outline-none"
              />
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-on-primary hover:opacity-90 active:scale-95 transition-all"
              >
                Notify Me
              </button>
            </form>
            <p className="text-[11px] text-outline">
              Zero spam. Unsubscribe anytime with a single click.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-text-secondary">
              Everything you need to know about Picfix service and billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5 space-y-2">
                <div className="flex items-start gap-2">
                  <HelpCircle className="size-4 shrink-0 text-accent-lavender mt-0.5" />
                  <h4 className="font-label-md text-sm font-semibold text-primary">{faq.q}</h4>
                </div>
                <p className="pl-6 text-xs text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingShell>
  );
}
