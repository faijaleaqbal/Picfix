import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { TargetPdfCompressor } from "@/components/site/target-pdf-compressor";

export const metadata: Metadata = {
  title: "Compress PDF to 500KB Online Free | Picfix",
  description:
    "Compress PDF file size to 500KB or less for online job applications, SSC, UPSC, and govt exam portals.",
};

export default function CompressPdf500KbPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Compress PDF to 500KB"
        description="Reduce PDF file size to 500 KB or less while keeping text sharp and readable."
      />

      <TargetPdfCompressor targetKb={500} />

      <FaqSection
        centered
        items={[
          {
            q: "Why do portal forms require under 500KB PDF?",
            a: "Most recruitment portals, university admission forms, and passport applications enforce strict upload limits like 500KB to manage server storage.",
          },
          {
            q: "Will my text quality be degraded?",
            a: "No, standard PDF fonts and text formatting are preserved without pixelation.",
          },
        ]}
      />

      <RelatedTools slugs={["compress-pdf", "merge-pdf", "split-pdf", "pdf-to-jpg"]} />
    </LandingShell>
  );
}
