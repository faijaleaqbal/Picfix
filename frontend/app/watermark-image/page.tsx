import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { WatermarkTool } from "./tool";

export const metadata: Metadata = {
  title: "Add Watermark",
  description:
    "Protect your images with text or logo overlays. Customize opacity, position, and scale for perfect integration.",
};

export default function WatermarkImagePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Add Watermark"
        description="Protect your images with text or logo overlays. Customize opacity, position, and scale for perfect integration."
      />

      <WatermarkTool />

      {/* FAQ Section */}
      <FaqSection
        items={[
          {
            q: "Can I save my watermark settings?",
            a: "Yes, Pro users can save custom watermark templates including logos, text styling, and positioning for quick application across multiple images.",
          },
          {
            q: "Does adding a watermark reduce image quality?",
            a: "No, our processing engine ensures your underlying image maintains its original resolution and color profile when exporting.",
          },
        ]}
      />

      {/* Related Tools */}
      <RelatedTools
        slugs={["resize-image-pixel", "compress-image", "png-to-jpeg"]}
        columns={3}
      />
    </LandingShell>
  );
}
