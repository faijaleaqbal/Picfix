import type { Metadata } from "next";
import { FolderArchive, Repeat, Zap } from "lucide-react";
import { LandingShell } from "@/components/site/page-shells";
import { FeatureCards } from "@/components/site/sections";
import { JpegToJpgTool } from "./tool";

export const metadata: Metadata = {
  title: "JPEG to JPG Converter",
  description:
    "Standardize file extensions and maintain compatibility across all professional workflows with zero quality loss.",
};

export default function JpegToJpgPage() {
  return (
    <LandingShell mainClassName="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter">
      {/* Tool Header */}
      <div className="mb-stack-lg space-y-stack-sm">
        <div className="flex items-center gap-3 text-accent-lavender">
          <Repeat className="text-2xl" />
          <span className="font-label-md text-label-md uppercase tracking-wider">
            Format Conversion
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
          JPEG to JPG Converter
        </h1>
        <p className="max-w-2xl font-body-lg text-body-lg text-text-secondary">
          Standardize file extensions and maintain compatibility across all professional
          workflows with zero quality loss.
        </p>
      </div>

      <JpegToJpgTool />

      {/* Info/Features Section */}
      <FeatureCards
        items={[
          {
            icon: <Zap className="size-5" />,
            title: "Instant Processing",
            body: "Files are converted locally in your browser. No uploads required, ensuring maximum privacy and speed.",
          },
          {
            icon: <FolderArchive className="size-5" />,
            title: "Batch Conversion",
            body: "Process hundreds of .jpeg files simultaneously into standard .jpg format with a single click.",
          },
        ]}
      />
    </LandingShell>
  );
}
