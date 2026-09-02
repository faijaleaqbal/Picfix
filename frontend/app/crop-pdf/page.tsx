import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CropPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Crop PDF Online | Trim PDF Margins Free | Picfix",
  description:
    "Crop PDF margins and trim blank borders online for free. Adjust and crop PDF pages with precision.",
};

export default function CropPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Crop PDF Online"
        description="Trim excess white margins and header/footer space from your PDF document."
      />

      <CropPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Why crop PDF margins?",
            a: "Trimming blank margins makes documents much easier to read on e-readers, tablets, and smartphones by increasing effective text scale.",
          },
        ]}
      />

      <RelatedTools slugs={["rotate-pdf", "split-pdf", "compress-pdf", "merge-pdf"]} />
    </LandingShell>
  );
}
