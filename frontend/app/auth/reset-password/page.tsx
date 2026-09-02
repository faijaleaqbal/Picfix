"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LandingShell } from "@/components/site/page-shells";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdateMode = searchParams.get("type") === "recovery";

  // Forgot password request state
  const [email, setEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  // New password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password?type=recovery`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setRequestSent(true);
      }
    } catch {
      setErrorMsg("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setPasswordUpdated(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setErrorMsg("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-border bg-surface-container-low p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Mode: Update Password after clicking email link */}
        {isUpdateMode ? (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
                <KeyRound className="size-3.5" />
                Set New Password
              </div>
              <h1 className="font-headline-md text-2xl font-bold text-primary">
                Update Password
              </h1>
              <p className="text-xs text-text-secondary">
                Enter your new secure password below to regain access.
              </p>
            </div>

            {passwordUpdated ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-label-md text-base font-bold text-primary">
                    Password Updated!
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Your password has been changed successfully. Redirecting to sign in...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-secondary">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                      Confirm New Password
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
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          /* Mode: Request Password Reset Email */
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-lavender/30 bg-accent-lavender/10 px-3 py-1 text-xs font-semibold text-accent-lavender">
                <KeyRound className="size-3.5" />
                Password Recovery
              </div>
              <h1 className="font-headline-md text-2xl font-bold text-primary">
                Forgot Password?
              </h1>
              <p className="text-xs text-text-secondary">
                Enter your registered email address and we will send you a link to reset your password.
              </p>
            </div>

            {requestSent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-label-md text-base font-bold text-primary">
                    Reset Link Sent
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Check your email inbox at <span className="font-semibold text-primary">{email}</span>. Click the link provided to choose a new password.
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
                {errorMsg && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-secondary">
                      Registered Email Address
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-label-md text-xs font-bold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="border-t border-border pt-4 text-center text-xs text-text-secondary">
                  Remembered your password?{" "}
                  <Link href="/login" className="font-semibold text-accent-lavender hover:underline">
                    Back to Sign in
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <LandingShell>
      <Suspense fallback={<div className="min-h-[75vh]" />}>
        <ResetPasswordContent />
      </Suspense>
    </LandingShell>
  );
}
