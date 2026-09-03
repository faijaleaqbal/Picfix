"use client";

import { Suspense } from "react";
import { AuthPage } from "@/components/ui/auth-page";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1b223c]" />}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}
