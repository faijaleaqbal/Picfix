import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { OrganizePdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Organize PDF Online | Sort and Reorder PDF Pages | Picfix",
  description:
    "Sort, reorder, and organize PDF pages online for free. Arrange pages in any sequence easily.",
};

export default function OrganizePdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Organize PDF Pages"
        description="Sort and rearrange the pages of your PDF document into your custom desired order."
      />

      <OrganizePdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Can I repeat pages in the sequence?",
            a: "Yes! If you enter '1, 1, 2', page 1 will be duplicated in the output document.",
          },
        ]}
      />

      <RelatedTools slugs={["merge-pdf", "split-pdf", "remove-pages-pdf", "rotate-pdf"]} />
    </LandingShell>
  );
}
