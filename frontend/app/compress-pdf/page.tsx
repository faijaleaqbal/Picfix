import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { CompressPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Compress PDF Online | Reduce PDF Size | Picfix",
  description:
    "Compress PDF files online for free. Reduce PDF size while maintaining maximum quality.",
};

export default function CompressPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Compress PDF Online"
        description="Reduce PDF file size while optimizing for maximal PDF quality."
      />

      <CompressPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "How does PDF compression work?",
            a: "Our PDF compressor strips duplicate objects, deflates redundant content streams, and optimizes font tables to minimize file footprint without degrading text clarity.",
          },
          {
            q: "Will text stay sharp?",
            a: "Yes! Vector text and fonts stay 100% sharp and readable at all zoom levels.",
          },
        ]}
      />

      <RelatedTools slugs={["merge-pdf", "split-pdf", "image-to-pdf", "rotate-pdf"]} />
    </LandingShell>
  );
}
