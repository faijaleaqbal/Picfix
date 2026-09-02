import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { MergePhotoSignatureTool } from "./tool";

export const metadata: Metadata = {
  title: "Merge Photo and Signature Online | Pi7 Photo Tool",
  description:
    "Combine photo and signature vertically into one single image for online application forms like UPSSSC, SSC, IBPS, and state government jobs.",
};

export default function MergePhotoSignaturePage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Merge Photo and Signature Online"
        description="Easily combine your passport photo and digital signature into a single file for government job portals."
      />

      <MergePhotoSignatureTool />

      <FaqSection
        centered
        items={[
          {
            q: "How to merge photo and signature into one image?",
            a: "Upload your passport photo in slot 1 and your signature image in slot 2. The tool automatically aligns them vertically on a clean background and lets you download a merged JPG.",
          },
          {
            q: "Can I reduce the file size of the merged photo after downloading?",
            a: "Yes, you can use our Reduce Image Size In KB tool to compress the merged file to under 50KB or 100KB as required by your exam portal.",
          },
        ]}
      />

      <RelatedTools slugs={["reduce-image-size-in-kb", "passport-size-photo", "add-name-and-date-on-photo", "crop-image"]} />
    </LandingShell>
  );
}
