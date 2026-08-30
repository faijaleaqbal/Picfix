import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CropImageTool } from "./tool";

export const metadata: Metadata = {
  title: "Crop Image",
  description:
    "Trim edges and focus on what matters. Precision cropping tools for professional results.",
};

export default function CropImagePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Crop Image"
        description="Trim edges and focus on what matters. Precision cropping tools for professional results."
      />

      {/* Tool Workspace (upload + crop settings, all wired) */}
      <CropImageTool />

      {/* FAQ Section */}
      <FaqSection
        centered
        items={[
          {
            q: "Does cropping reduce image quality?",
            a: "Cropping removes pixels, which technically reduces the overall resolution, but it does not degrade the quality of the remaining pixels. It simply changes the framing.",
          },
          {
            q: "Can I crop to a specific size in inches or cm?",
            a: "Currently, our tool operates in pixels. To achieve a specific print size, crop to the desired aspect ratio first, then use our Resize tool to adjust the DPI and print dimensions.",
          },
        ]}
      />

      {/* Related Tools Grid */}
      <RelatedTools slugs={["square-image-cropper", "resize-image-pixel", "circle-crop", "compress-image"]} />
    </LandingShell>
  );
}
