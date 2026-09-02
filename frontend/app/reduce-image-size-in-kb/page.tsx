import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CompressImageTool } from "@/app/compress-image/tool";

export const metadata: Metadata = {
  title: "Reduce Image Size In KB | Pi7 Image Reducer",
  description:
    "Reduce image size in KB for government portals, job applications, college admissions, and more with Picfix Image Reducer. Compress photos to 20kb, 50kb, 100kb, 200kb while maintaining quality.",
};

export default function ReduceImageSizeInKbPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Reduce Image Size In KB"
        description="Compress an image to 20kb, 50kb, 100KB, 200KB, or any other size with precision quality control."
      />

      <CompressImageTool initialTargetKb={50} />

      <FaqSection
        centered
        items={[
          {
            q: "How to reduce image size to 50KB or 20KB?",
            a: "Simply upload your picture, select or enter your desired target size in KB (e.g. 20, 50, 100), and click Compress. Picfix automatically finds the best quality that stays under your required limit.",
          },
          {
            q: "Is it safe to compress private document photos?",
            a: "Yes! All uploaded images are processed in memory buffers and purged automatically within 30 minutes. We never store or train on your photos.",
          },
        ]}
      />

      <RelatedTools slugs={["passport-size-photo", "resize-for-pan-card", "crop-image", "resize-image-pixel"]} />
    </LandingShell>
  );
}
