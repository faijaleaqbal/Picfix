import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { PngToJpegTool } from "./tool";

export const metadata: Metadata = {
  title: "PNG to JPEG Converter",
  description:
    "Convert transparent images to solid backgrounds with precision control over compression artifacts.",
};

export default function PngToJpegPage() {
  return (
    <LandingShell>
      {/* Tool Header */}
      <div className="mb-stack-lg max-w-3xl">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary md:text-headline-lg md:font-headline-lg">
          PNG to JPEG Converter
        </h1>
        <p className="font-body-md text-body-md text-text-secondary">
          Convert transparent images to solid backgrounds with precision control over
          compression artifacts.
        </p>
      </div>

      <PngToJpegTool />
    </LandingShell>
  );
}
