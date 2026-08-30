import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CompressImageTool } from "./tool";

export const metadata: Metadata = {
  title: "Compress Image",
  description:
    "Reduce file size without losing quality. Optimized for web and performance.",
};

export default function CompressImagePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Compress Image"
        description="Reduce file size without losing quality. Optimized for web and performance."
      />

      {/* Bento Grid Layout for Tool (upload + preview + settings) */}
      <CompressImageTool />

      {/* FAQ Section */}
      <FaqSection
        centered
        items={[
          {
            q: "Does compression reduce image quality?",
            a: "We use smart lossy compression techniques to selectively decrease the number of colors in the image data. The effect is nearly invisible but it makes a very large difference in file size.",
          },
          {
            q: "Are my images secure?",
            a: "Your images are processed on our servers and automatically deleted immediately after processing.",
          },
        ]}
      />

      {/* Related Tools Grid */}
      <RelatedTools slugs={["crop-image", "resize-image-pixel", "png-to-jpeg", "ai-enhance-image"]} />
    </LandingShell>
  );
}
