import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Picfix is completely free to use. All 21 image editing and conversion tools are available with no subscription required.",
};

const FAQS = [
  {
    q: "Is Picfix free to use?",
    a: "Yes. All current image editing, compression, resizing, conversion, and cropping tools are 100% free with no account or credit card required.",
  },
  {
    q: "What is the file upload size limit?",
    a: "The web tools currently accept images up to 15 MB per file for high-speed processing.",
  },
  {
    q: "Are my uploaded photos stored on your servers?",
    a: "No. Picfix operates on ephemeral processing. Uploaded files are processed in temporary memory buffers and automatically purged immediately after download.",
  },
  {
    q: "Are there any paid plans or subscriptions today?",
    a: "No. There are currently no active paid plans, subscriptions, or credit systems. All available tools are accessible to everyone free of charge.",
  },
];

export default function PricingPage() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-4xl py-8 sm:py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <Sparkles className="size-3.5" />
            Simple & Transparent
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            100% Free Online Image Studio
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Every tool in the Picfix suite is free to use directly in your browser. No sign-up, no subscriptions, and no hidden fees.
          </p>
        </div>

        {/* Free Plan Showcase */}
        <div className="mx-auto max-w-xl rounded-3xl border border-accent-lavender/40 bg-surface-container-high/60 p-8 shadow-xl ring-1 ring-accent-lavender/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent-lavender border border-border">
                Standard Access
              </span>
              <h2 className="mt-3 font-headline-md text-2xl font-bold text-primary">Free for Everyone</h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-4xl font-extrabold text-primary">$0</span>
              <span className="block text-xs text-text-secondary">Free forever</span>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
            Full access to all 21 image transformation tools with high-speed server processing and privacy-first ephemeral storage.
          </p>

          <div className="my-6 border-t border-border" />

          <ul className="space-y-3 text-xs sm:text-sm text-text-secondary">
            {[
              "All 21 image editing, cropping, resizing, and conversion tools",
              "Up to 15 MB file upload limit per image",
              "Standard format support (JPG, PNG, WebP, GIF, SVG, AVIF, HEIC)",
              "Zero watermarks added to your output",
              "No registration or login required",
              "Ephemeral processing: files are automatically deleted after use",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="size-4 shrink-0 text-accent-lavender mt-0.5" />
                <span className="text-primary">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href="/"
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-accent-lavender px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-md transition-all hover:bg-accent-lavender/90 active:scale-95"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Roadmap / Status Notice */}
        <div className="mt-12 rounded-2xl border border-border bg-surface-container-low p-6 text-center space-y-2 max-w-xl mx-auto">
          <h3 className="font-label-md text-sm font-semibold text-primary">
            Future Capabilities & Inquiries
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            High-volume batch pipelines and advanced AI processing are currently under planning. For technical inquiries or suggestions, contact us at{" "}
            <a href="mailto:support@picfix.duckdns.org" className="text-accent-lavender underline">
              support@picfix.duckdns.org
            </a>.
          </p>
        </div>

        {/* FAQs */}
        <div className="mt-16 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-text-secondary">
              Common questions about Picfix usage and file processing.
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
