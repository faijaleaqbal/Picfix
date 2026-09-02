import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { WatermarkPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Watermark PDF Online | Stamp PDF | iLovePDF Alternative",
  description:
    "Stamp an image or text over your PDF in seconds. Choose typography, transparency and position.",
};

export default function WatermarkPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Watermark PDF Online"
        description="Stamp custom text watermarks across all pages of your PDF with transparency control."
      />

      <WatermarkPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Can I customize the opacity of the watermark?",
            a: "Yes, you can adjust the opacity slider between 10% and 80% so the text underneath remains completely legible.",
          },
          {
            q: "Does this protect my copyright?",
            a: "Yes, watermarking documents with 'CONFIDENTIAL' or your organization name helps protect proprietary materials from unauthorized distribution.",
          },
        ]}
      />

      <RelatedTools slugs={["add-page-numbers-pdf", "protect-pdf", "compress-pdf", "merge-pdf"]} />
    </LandingShell>
  );
}
