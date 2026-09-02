import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { IncreaseImageSizeTool } from "./tool";

export const metadata: Metadata = {
  title: "Increase Image Size in KB Online | Pi7 Tool",
  description:
    "Increase image size in KB online without losing picture quality. Perfect for online forms and portals requiring a minimum file size (e.g. 20KB, 50KB).",
};

export default function IncreaseImageSizePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Increase Image Size in KB Online"
        description="Easily increase image file size to 20KB, 50KB, or 100KB without modifying visual image quality."
      />

      <IncreaseImageSizeTool />

      <FaqSection
        centered
        items={[
          {
            q: "Why would I need to increase image size?",
            a: "Government portals and exam admission forms (like UPSC, SSC, NEET, GATE) often mandate a MINIMUM file size limit (e.g. 'Must be between 20KB and 50KB'). If your compressed photo is 8KB, the portal will reject it. This tool increases the size so it qualifies.",
          },
          {
            q: "Does this affect image quality?",
            a: "No! The image pixels remain 100% unchanged. We embed safe metadata padding into the file header so the file reaches the exact target byte count required.",
          },
        ]}
      />

      <RelatedTools slugs={["reduce-image-size-in-kb", "passport-size-photo", "resize-for-pan-card", "crop-image"]} />
    </LandingShell>
  );
}
