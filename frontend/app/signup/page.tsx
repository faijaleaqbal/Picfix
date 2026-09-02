"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LandingShell } from "@/components/site/page-shells";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingShell>
      <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-border bg-surface-container-low p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
              <Sparkles className="size-3.5" />
              100% Free Account
            </div>
            <h1 className="font-headline-md text-2xl font-bold text-primary">
              Create your account
            </h1>
            <p className="text-xs text-text-secondary">
              Join Picfix to manage your editing workflows and custom dimension presets.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-label-md text-base font-bold text-primary">
                  Check your inbox
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  We sent a confirmation link to <span className="font-semibold text-primary">{email}</span>. Click the link to verify your email and start editing!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-lavender hover:underline"
                >
                  <span>Back to Sign In</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {errorMsg && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-border bg-surface px-9 py-2.5 text-xs text-primary placeholder:text-text-secondary/60 focus:border-accent-lavender focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Password (minimum 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-surface pl-9 pr-10 py-2.5 text-xs text-primary placeholder:text-text-secondary/60 focus:border-accent-lavender focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-surface pl-9 pr-10 py-2.5 text-xs text-primary placeholder:text-text-secondary/60 focus:border-accent-lavender focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-label-md text-xs font-bold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Navigation */}
              <div className="border-t border-border pt-4 text-center text-xs text-text-secondary">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-accent-lavender hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </LandingShell>
  );
}
