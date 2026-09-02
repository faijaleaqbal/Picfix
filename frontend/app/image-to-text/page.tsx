import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { ImageToTextTool } from "./tool";

export const metadata: Metadata = {
  title: "Image to Text | AI OCR Text Extractor Online Free | Picfix",
  description:
    "Extract text from images, photos, receipts, documents, and screenshots online for free with AI OCR. Copy or download TXT.",
};

export default function ImageToTextPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="AI Image to Text (OCR)"
        description="Convert pictures into editable text instantly with local multilingual optical character recognition."
      />

      <ImageToTextTool />

      <FaqSection
        centered
        items={[
          {
            q: "Can it recognize Hindi and English?",
            a: "Yes! The local EasyOCR model is specifically trained to accurately read both English and Hindi text.",
          },
          {
            q: "Can I copy the extracted text?",
            a: "Yes! Click 'Copy Text' to copy it to your clipboard or 'Download .TXT' to save it as a text file.",
          },
        ]}
      />

      <RelatedTools slugs={["remove-image-background", "ai-remove-watermark", "compress-image", "crop-image"]} />
    </LandingShell>
  );
}
