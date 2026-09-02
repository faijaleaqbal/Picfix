import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CompressImageTool } from "@/app/compress-image/tool";

export const metadata: Metadata = {
  title: "Compress Image to 20KB Online | Picfix",
  description: "Easily compress image to 20KB online without losing quality. Ideal for job application forms, official portals, and exams.",
};

export default function CompressTo20KbPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Compress Image to 20KB Online"
        description="Quickly compress your JPG, PNG, or WebP picture to under 20KB for portal uploads."
      />

      <CompressImageTool initialTargetKb={20} />

      <FaqSection
        centered
        items={[
          {
            q: "How to compress image to 20KB?",
            a: "Just drop your photo above and click Compress. The 20KB target is already configured for you.",
          },
          {
            q: "Will my image lose sharpness at 20KB?",
            a: "Our smart multi-pass compression algorithm optimizes pixel structures to keep text and face details readable while staying within 20KB.",
          },
        ]}
      />

      <RelatedTools slugs={["reduce-image-size-in-kb", "passport-size-photo", "resize-for-pan-card", "crop-image"]} />
    </LandingShell>
  );
}
