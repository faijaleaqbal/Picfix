import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { PdfToJpgTool } from "./tool";

export const metadata: Metadata = {
  title: "PDF to JPG | Convert PDF to Images Online | iLovePDF Alternative",
  description:
    "Convert every PDF page into a high-resolution JPG image online. 100% free with no limits.",
};

export default function PdfToJpgPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="PDF to JPG Converter"
        description="Convert every page of your PDF file into a separate high quality JPG image."
      />

      <PdfToJpgTool />

      <FaqSection
        centered
        items={[
          {
            q: "What resolution are the extracted JPG images?",
            a: "Our engine renders pages at 2x high-DPI scale so text, graphs, and photography remain crystal clear.",
          },
          {
            q: "Can I download all pages at once?",
            a: "Yes! Use the 'Download All Pages' button to download all pages sequentially.",
          },
        ]}
      />

      <RelatedTools slugs={["image-to-pdf", "merge-pdf", "split-pdf", "compress-pdf"]} />
    </LandingShell>
  );
}
