import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { BlurImageTool } from "./tool";

export const metadata: Metadata = {
  title: "Blur Image Online Free | Pi7 Image Tool",
  description:
    "Easily blur pictures and photos online for free. Adjust blur intensity with live preview.",
};

export default function BlurImagePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Blur Image Online"
        description="Quickly apply smooth Gaussian blur to photos and images online with real-time strength control."
      />

      <BlurImageTool />

      <FaqSection
        centered
        items={[
          {
            q: "How to blur an image online?",
            a: "Upload your photo, adjust the blur slider to your preferred intensity, and click Download.",
          },
          {
            q: "Can I blur specific parts or the whole image?",
            a: "This tool applies smooth optical blur across the entire image. For circular framing or cropping, try our Circle Crop tool.",
          },
        ]}
      />

      <RelatedTools slugs={["circle-crop", "grayscale-image", "crop-image", "compress-image"]} />
    </LandingShell>
  );
}
