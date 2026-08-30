import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { PassportPhotoTool } from "./tool";

export const metadata: Metadata = {
  title: "Passport Size Photo",
  description:
    "Format photos for official documents with standard dimensions and alignment guides.",
};

export default function PassportSizePhotoPage() {
  return (
    <LandingShell>
      {/* Header */}
      <header className="mb-stack-lg">
        <h1 className="font-headline-lg-mobile mb-2 text-headline-lg-mobile text-primary md:text-headline-xl md:font-headline-xl">
          Passport Size Photo
        </h1>
        <p className="max-w-2xl font-body-md text-body-md text-text-secondary">
          Format photos for official documents with standard dimensions and alignment
          guides.
        </p>
      </header>

      <PassportPhotoTool />
    </LandingShell>
  );
}
