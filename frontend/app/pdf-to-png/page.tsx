import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { PdfToPngTool } from "./tool";

export const metadata: Metadata = {
  title: "PDF to PNG | Convert PDF to PNG Online Free | Picfix",
  description:
    "Convert PDF pages to lossless high-resolution PNG images online for free. Fast, high-DPI rendering.",
};

export default function PdfToPngPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="PDF to PNG Converter"
        description="Convert every page of your PDF file into a separate high quality PNG picture."
      />

      <PdfToPngTool />

      <FaqSection
        centered
        items={[
          {
            q: "What is the difference between PDF to JPG and PDF to PNG?",
            a: "PNG is a lossless image format which preserves fine lines, charts, and crisp typography without compression artifacts.",
          },
        ]}
      />

      <RelatedTools slugs={["pdf-to-jpg", "image-to-pdf", "merge-pdf", "compress-pdf"]} />
    </LandingShell>
  );
}
