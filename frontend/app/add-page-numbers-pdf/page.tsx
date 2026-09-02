import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { AddPageNumbersTool } from "./tool";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online | iLovePDF Alternative",
  description:
    "Insert page numbers in PDF documents easily. Choose positions, numbering style and typography.",
};

export default function AddPageNumbersPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Add Page Numbers to PDF"
        description="Stamp page numbers into your PDF documents with choice of placement in headers or footers."
      />

      <AddPageNumbersTool />

      <FaqSection
        centered
        items={[
          {
            q: "Where will the page numbers appear?",
            a: "You can position numbers in the Bottom Center, Bottom Right, or Top Right of each page in the 'Page X of Y' standard format.",
          },
          {
            q: "Is it completely free?",
            a: "Yes, adding page numbers to PDF documents is 100% free with no limits.",
          },
        ]}
      />

      <RelatedTools slugs={["watermark-pdf", "merge-pdf", "split-pdf", "compress-pdf"]} />
    </LandingShell>
  );
}
