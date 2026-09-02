import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { RemoveBackgroundTool } from "./tool";

export const metadata: Metadata = {
  title: "Remove Background From Image Free Online | Picfix",
  description:
    "100% automatically remove background from images in seconds. Free AI background remover with transparent PNG output.",
};

export default function RemoveBackgroundPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Remove Background From Image"
        description="Automatically remove image background online for free with AI. Get high quality transparent PNG."
      />

      <RemoveBackgroundTool />

      <FaqSection
        centered
        items={[
          {
            q: "How does the AI background remover work?",
            a: "Our AI model analyzes your image to segment foreground subjects like people, products, or cars from the background, creating a transparent cutout.",
          },
          {
            q: "Is this tool completely free?",
            a: "Yes, Picfix image background removal is 100% free with no watermark or registration required.",
          },
        ]}
      />

      <RelatedTools slugs={["passport-size-photo", "crop-image", "circle-crop", "compress-image"]} />
    </LandingShell>
  );
}
