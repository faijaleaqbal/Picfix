import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { TargetPdfCompressor } from "@/components/site/target-pdf-compressor";

export const metadata: Metadata = {
  title: "Compress PDF to 1MB Online Free | Picfix",
  description:
    "Compress PDF file size to 1MB or less easily. Quick online tool without quality loss.",
};

export default function CompressPdf1MbPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Compress PDF to 1MB"
        description="Reduce large PDF documents to 1MB or less for hassle-free email attachments and uploads."
      />

      <TargetPdfCompressor targetKb={1024} />

      <FaqSection
        centered
        items={[
          {
            q: "Can I compress scanned book PDFs to 1MB?",
            a: "Yes, our engine optimizes compression across streams to make large documents email-ready under 1MB.",
          },
        ]}
      />

      <RelatedTools slugs={["compress-pdf", "merge-pdf", "split-pdf", "pdf-to-jpg"]} />
    </LandingShell>
  );
}
