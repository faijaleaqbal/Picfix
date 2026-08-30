import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { AiEnhanceTool } from "./tool";

export const metadata: Metadata = {
  title: "AI Enhance",
  description:
    "Intelligent upscaling and clarity for low-res photos. Breathe new life into your images with a single click.",
};

export default function AiEnhanceImagePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="AI Enhance"
        description="Intelligent upscaling and clarity for low-res photos. Breathe new life into your images with a single click."
      />

      <AiEnhanceTool />

      {/* Related Tools Grid */}
      <RelatedTools
        slugs={["compress-image", "grayscale-image", "rotate-image", "crop-image"]}
      />
    </LandingShell>
  );
}
