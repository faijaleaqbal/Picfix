import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { PdfMetadataTool } from "./tool";

export const metadata: Metadata = {
  title: "PDF Metadata Editor | View & Edit PDF Properties | Picfix",
  description:
    "View and edit PDF metadata properties (Title, Author, Subject, Keywords) online for free. Fast and secure.",
};

export default function PdfMetadataPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="PDF Metadata Editor"
        description="View and update PDF metadata attributes such as title, author, subject, and search keywords."
      />

      <PdfMetadataTool />

      <FaqSection
        centered
        items={[
          {
            q: "What is PDF metadata used for?",
            a: "Metadata stores internal document properties that search engines, catalog software, and operating systems use to identify and categorize PDF files.",
          },
        ]}
      />

      <RelatedTools slugs={["add-page-numbers-pdf", "watermark-pdf", "compress-pdf", "merge-pdf"]} />
    </LandingShell>
  );
}
