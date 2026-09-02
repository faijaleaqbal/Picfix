import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { RotatePdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Rotate PDF Online | Turn PDF Pages | Picfix",
  description:
    "Rotate your PDF files the way you need. Rotate multiple PDF pages at the same time by 90 or 180 degrees.",
};

export default function RotatePdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Rotate PDF Online"
        description="Rotate upside-down or sideways PDF pages by 90, 180, or 270 degrees in seconds."
      />

      <RotatePdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Can I permanently save the rotated orientation?",
            a: "Yes! When you download the rotated PDF, the rotation metadata is written into the document header so it always displays upright across all readers and print dialogs.",
          },
          {
            q: "Does rotating PDF degrade quality?",
            a: "No! Rotating updates page transformation matrices without re-encoding fonts or rasterizing text.",
          },
        ]}
      />

      <RelatedTools slugs={["merge-pdf", "split-pdf", "compress-pdf", "image-to-pdf"]} />
    </LandingShell>
  );
}
