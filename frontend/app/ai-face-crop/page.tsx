import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { AiFaceCropTool } from "./tool";

export const metadata: Metadata = {
  title: "AI Smart Face Crop | Auto Center Portrait for Passport Free | Picfix",
  description:
    "Auto-crop and center faces in photos with AI. Perfect 3:4 passport proportions and 1:1 avatar centering online for free.",
};

export default function AiFaceCropPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="AI Smart Face Crop"
        description="Automatically detect facial landmarks and crop your photo with optimal head-to-body margins for passports and avatars."
      />

      <AiFaceCropTool />

      <FaqSection
        centered
        items={[
          {
            q: "How does AI detect face positioning?",
            a: "The tool utilizes MediaPipe deep learning to identify facial contours and calculates the ideal 70% head height ratio standard for passport photos.",
          },
        ]}
      />

      <RelatedTools slugs={["passport-size-photo", "change-photo-background", "ai-enhance-image", "crop-image"]} />
    </LandingShell>
  );
}
