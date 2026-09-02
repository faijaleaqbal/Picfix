import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { SplitPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Split PDF Online | Extract Pages from PDF | iLovePDF Alternative",
  description:
    "Split a PDF into multiple pages or extract specific page ranges online. Free, fast and secure.",
};

export default function SplitPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Split PDF Online"
        description="Separate one page or a whole set for easy conversion into independent PDF files."
      />

      <SplitPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "How to extract specific pages from a PDF?",
            a: "Upload your document, enter the page numbers or ranges (e.g. 1-3, 5), and click 'Split PDF'. Your new PDF will only contain those pages.",
          },
          {
            q: "Is the original PDF modified?",
            a: "No, your original file stays safe on your computer. A new PDF file containing the extracted pages is created for download.",
          },
        ]}
      />

      <RelatedTools slugs={["merge-pdf", "compress-pdf", "rotate-pdf", "image-to-pdf"]} />
    </LandingShell>
  );
}
