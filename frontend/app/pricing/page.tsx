"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, Sparkles, HelpCircle, ArrowRight, Loader2, Zap, ShieldCheck } from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const FAQS = [
  {
    q: "Can I use standard image and PDF tools for free?",
    a: "Yes! All standard crop, resize, compress, PDF merge, PDF split, and format conversion tools remain 100% free with no account or card required.",
  },
  {
    q: "How do AI credits work on the Pro plan?",
    a: "Pro subscribers receive 100 AI credits every month. High-tier operations (Background Removal: 1 credit, AI Enhance: 2 credits, etc.) deduct credits atomically from your balance.",
  },
  {
    q: "Is payment processed securely?",
    a: "Yes, all transactions are securely processed through Razorpay's PCI-DSS compliant checkout. Picfix never stores your credit card or banking details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your subscription at any time. Your Pro plan and remaining credits will remain active until the end of your billing period.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [credits, setCredits] = useState<number>(10);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchAccountData();
      }
    });
  }, [supabase]);

  const fetchAccountData = async () => {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const json = await res.json();
        if (json.wallet) {
          setCurrentPlan(json.wallet.planId);
          setCredits(json.wallet.balance);
        }
      }
    } catch {
      // Background fetch error
    }
  };

  const handleSubscribe = async (planKey: "pro-monthly" | "pro-yearly") => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create subscription order.");
      }

      const orderData = await res.json();

      // 2. Open Razorpay Checkout modal
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK is loading. Please try again in a moment.");
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Picfix Pro",
        description: `Upgrade to ${orderData.planName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: {
          color: "#4956a5",
        },
        handler: async (response: RazorpayResponse) => {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planKey,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErr.error || "Payment verification failed.");
            }

            setSuccessMsg("Payment successful! Your Pro subscription is now active with 100 AI credits.");
            await fetchAccountData();
          } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Payment verification error");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = currentPlan === "pro" || currentPlan === "pro_max";

  return (
    <LandingShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-5xl py-8 sm:py-12 px-4">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
            <Sparkles className="size-3.5" />
            Simple Pricing & AI Credits
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
            Unlock High-Speed AI Processing
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-text-secondary">
            Standard tools are always free. Upgrade to Pro for high-tier AI background removal, image enhancement, and bulk workflows.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-primary" : "text-text-secondary"}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(b => b === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-white/20 transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
              aria-checked={billingCycle === "yearly"}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-[#ffeb3b] shadow ring-0 transition duration-200 ease-in-out ${
                  billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${billingCycle === "yearly" ? "text-primary" : "text-text-secondary"}`}>
                Yearly
              </span>
              <span className="rounded-full bg-accent-lavender/20 px-2 py-0.5 text-[10px] font-bold text-accent-lavender">
                Save ~37%
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-xs text-green-400 text-center">
            {successMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-3xl border border-border bg-surface-container-low p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-secondary border border-border">
                  Free Tier
                </span>
                {currentPlan === "free" && user && (
                  <span className="rounded-full bg-accent-lavender/20 px-2.5 py-0.5 text-[11px] font-bold text-accent-lavender">
                    Active Plan
                  </span>
                )}
              </div>

              <h2 className="mt-4 font-headline-md text-2xl font-bold text-primary">Free Forever</h2>
              <p className="mt-2 text-xs text-text-secondary">
                Standard image resizing, compression, cropping, and PDF conversions.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-extrabold text-primary">₹0</span>
                <span className="text-xs text-text-secondary">/ forever</span>
              </div>

              <div className="my-6 border-t border-border" />

              <ul className="space-y-3 text-xs text-text-secondary">
                {[
                  "All 67+ basic image & PDF tools",
                  "10 Free AI starter credits on signup",
                  "15 MB max upload size",
                  "Zero watermarks added",
                  "Ephemeral privacy-first storage",
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="size-4 text-accent-lavender shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-primary hover:bg-surface-container-high transition-colors"
              >
                <span>Use Free Tools</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border-2 border-[#4956a5] bg-surface-container-high/60 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3 right-6 rounded-full bg-[#ffeb3b] px-3 py-0.5 text-[11px] font-extrabold text-[#202020] uppercase tracking-wider shadow">
              Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#4956a5]/30 px-3 py-1 text-xs font-semibold text-accent-lavender border border-[#4956a5]">
                  Pro Access
                </span>
                {isPro && (
                  <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[11px] font-bold text-green-400">
                    Active Plan ({credits} credits)
                  </span>
                )}
              </div>

              <h2 className="mt-4 font-headline-md text-2xl font-bold text-primary">Pro Plan</h2>
              <p className="mt-2 text-xs text-text-secondary">
                High-speed AI microservices with monthly credits quota.
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-extrabold text-primary">
                  {billingCycle === "monthly" ? "₹199" : "₹1,499"}
                </span>
                <span className="text-xs text-text-secondary">
                  {billingCycle === "monthly" ? "/ month" : "/ year (₹125/mo)"}
                </span>
              </div>

              <div className="my-6 border-t border-border" />

              <ul className="space-y-3 text-xs text-text-secondary">
                {[
                  "100 AI Credits granted every billing period",
                  "AI Background Removal (1 credit)",
                  "AI Enhance & Face Crop (2 credits)",
                  "AI Watermark Eraser (2 credits)",
                  "Priority GPU processing pipeline",
                  "Cancel anytime with 1-click",
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Zap className="size-4 text-[#ffeb3b] shrink-0" />
                    <span className="text-primary">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={loading || isPro}
                onClick={() => handleSubscribe(billingCycle === "monthly" ? "pro-monthly" : "pro-yearly")}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#4956a5] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-[#3f4a90] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Processing Checkout...</span>
                  </>
                ) : isPro ? (
                  <span>Pro Plan Active</span>
                ) : (
                  <>
                    <span>Upgrade to Pro ({billingCycle === "monthly" ? "₹199" : "₹1,499"})</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Money Back */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-green-400" />
            <span>Razorpay Test Mode Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-[#ffeb3b]" />
            <span>Instant Credit Grant</span>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-text-secondary">
              Details on subscriptions, billing, and credit renewal.
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
