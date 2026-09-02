import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { MergePdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free | Picfix",
  description:
    "Combine PDFs in the order you want with the easiest online PDF merger. 100% free, secure, and fast.",
};

export default function MergePdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Merge PDF Files"
        description="Combine multiple PDF documents into one single PDF in your preferred order."
      />

      <MergePdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "How can I merge multiple PDF files into one?",
            a: "Upload two or more PDF files, arrange them in your desired order using the arrow buttons, and click 'Merge PDF Files'. You can download the combined document instantly.",
          },
          {
            q: "Is it safe to merge confidential documents?",
            a: "Yes! Processing happens with client-side encryption and memory streams without saving files permanently.",
          },
        ]}
      />

      <RelatedTools slugs={["split-pdf", "compress-pdf", "image-to-pdf", "rotate-pdf"]} />
    </LandingShell>
  );
}
