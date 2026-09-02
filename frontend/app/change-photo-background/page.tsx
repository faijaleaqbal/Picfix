import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { ChangePhotoBackgroundTool } from "./tool";

export const metadata: Metadata = {
  title: "Change Photo Background | White & Blue Passport Background Free | Picfix",
  description:
    "Change photo background to plain white or light blue for passport, SSC, UPSC, and visa applications online for free.",
};

export default function ChangePhotoBackgroundPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Change Photo Background Color"
        description="Replace any background with official White, Light Blue, or custom studio colors for passport and ID photos."
      />

      <ChangePhotoBackgroundTool />

      <FaqSection
        centered
        items={[
          {
            q: "Which background color is required for Indian passport and SSC exams?",
            a: "Indian Passport, SSC, UPSC, and State Govt applications strictly require a plain white or off-white background.",
          },
          {
            q: "Which background is required for US & Schengen Visas?",
            a: "Most international visa requirements accept pure white or very light neutral blue backgrounds.",
          },
        ]}
      />

      <RelatedTools slugs={["passport-size-photo", "remove-image-background", "ai-enhance-image", "ai-remove-watermark"]} />
    </LandingShell>
  );
}
