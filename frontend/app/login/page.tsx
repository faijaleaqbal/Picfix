"use client";

import { Suspense } from "react";
import { AuthPage } from "@/components/ui/auth-page";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <AuthPage mode="login" />
    </Suspense>
  );
}

