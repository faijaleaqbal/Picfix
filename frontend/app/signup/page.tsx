"use client";

import { Suspense } from "react";
import { AuthPage } from "@/components/ui/auth-page";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}

