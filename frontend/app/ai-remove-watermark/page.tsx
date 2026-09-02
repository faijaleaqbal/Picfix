import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { AiRemoveWatermarkTool } from "./tool";

export const metadata: Metadata = {
  title: "AI Watermark Remover | Erase Watermarks & Objects Free | Picfix",
  description:
    "Remove watermarks, date stamps, copyright text, and unwanted objects from images online for free with AI inpainting.",
};

export default function AiRemoveWatermarkPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="AI Watermark Remover"
        description="Erase unwanted watermarks, logos, dates, and background objects seamlessly with intelligent AI texture blending."
      />

      <AiRemoveWatermarkTool />

      <FaqSection
        centered
        items={[
          {
            q: "How does AI Watermark Removal work?",
            a: "When you paint over a watermark, the tool analyzes surrounding background textures and seamlessly fills the area, making the watermark disappear.",
          },
          {
            q: "Is it completely free?",
            a: "Yes! 100% free with no subscription, watermark on result, or image upload limits.",
          },
        ]}
      />

      <RelatedTools slugs={["remove-image-background", "ai-enhance-image", "crop-image", "compress-image"]} />
    </LandingShell>
  );
}
