import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { RemovePagesTool } from "./tool";

export const metadata: Metadata = {
  title: "Remove Pages from PDF Online | Picfix",
  description:
    "Delete unwanted pages from PDF document online for free. Select and remove pages instantly.",
};

export default function RemovePagesPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Remove Pages from PDF"
        description="Delete pages from a PDF document to create a lean, relevant file."
      />

      <RemovePagesTool />

      <FaqSection
        centered
        items={[
          {
            q: "How to delete pages from a PDF?",
            a: "Upload your document, type the comma-separated page numbers you wish to remove (e.g. 2, 4), and click 'Delete Pages'.",
          },
          {
            q: "Will the page order of remaining pages change?",
            a: "No, all other pages remain in their exact original sequence.",
          },
        ]}
      />

      <RelatedTools slugs={["split-pdf", "merge-pdf", "compress-pdf", "rotate-pdf"]} />
    </LandingShell>
  );
}
