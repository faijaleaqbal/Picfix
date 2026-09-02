import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { SscPhotoResizerTool } from "./tool";

export const metadata: Metadata = {
  title: "SSC Photo Resizer Online (3.5 x 4.5 cm, 20-50 KB) | Pi7",
  description:
    "Resize photo for SSC CGL, CHSL, MTS, and GD forms online. Automatically crops to 3.5 cm × 4.5 cm and compresses within 20KB to 50KB.",
};

export default function SscPhotoResizerPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="SSC Photo Resizer Online"
        description="Resize and compress your passport photo to exact SSC specifications (3.5 cm × 4.5 cm, 20 KB to 50 KB)."
      />

      <SscPhotoResizerTool />

      <FaqSection
        centered
        items={[
          {
            q: "What is the photo size requirement for SSC exams?",
            a: "Staff Selection Commission (SSC) requires a scanned colour passport size photograph in JPEG format with dimensions 3.5 cm (width) × 4.5 cm (height) and file size between 20 KB and 50 KB.",
          },
          {
            q: "Do I also need to add Name and Date of Photo?",
            a: "If your SSC notification mentions DOP (Date of Photo), you can use our 'Add Name and Date on Photo' tool to print it at the bottom.",
          },
        ]}
      />

      <RelatedTools slugs={["add-name-and-date-on-photo", "merge-photo-and-signature", "passport-size-photo", "reduce-image-size-in-kb"]} />
    </LandingShell>
  );
}
