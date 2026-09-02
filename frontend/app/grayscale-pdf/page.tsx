import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { GrayscalePdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Convert PDF to Grayscale | Black and White PDF Online | Picfix",
  description:
    "Convert color PDF documents to monochrome black and white grayscale online for free. Save printer ink and toner.",
};

export default function GrayscalePdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Convert PDF to Grayscale"
        description="Turn colorful PDF documents into high-contrast black & white grayscale files."
      />

      <GrayscalePdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Does grayscale reduce print costs?",
            a: "Yes! Converting documents to pure grayscale avoids using expensive color toner cartridges when printing copies.",
          },
        ]}
      />

      <RelatedTools slugs={["compress-pdf", "crop-pdf", "pdf-to-jpg", "merge-pdf"]} />
    </LandingShell>
  );
}
