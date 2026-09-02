import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { ColorPickerTool } from "./tool";

export const metadata: Metadata = {
  title: "Get Color Code From Image Online | Pi7 Color Picker",
  description:
    "Extract and identify exact color codes (HEX, RGB, HSL) from any image or photo online for free with Picfix Color Picker.",
};

export default function ColorPickerPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Get Color Code From Image"
        description="Hover or click any pixel on your image to instantly discover and copy HEX, RGB, and HSL color values."
      />

      <ColorPickerTool />

      <FaqSection
        centered
        items={[
          {
            q: "How to find color code from an image?",
            a: "Upload your picture, hover over any area with your cursor, and click. The precise HEX, RGB, and HSL values will appear in the sidebar with 1-click copy buttons.",
          },
          {
            q: "Is my image uploaded to any external server?",
            a: "No! The color picker extracts pixel data directly in your browser using HTML5 Canvas APIs, ensuring 100% client-side privacy.",
          },
        ]}
      />

      <RelatedTools slugs={["grayscale-image", "watermark-image", "crop-image", "compress-image"]} />
    </LandingShell>
  );
}
