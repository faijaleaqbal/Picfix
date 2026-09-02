import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { AddNameDatePhotoTool } from "./tool";

export const metadata: Metadata = {
  title: "Add Name and Date on Photo Online | Pi7 Photo Tool",
  description:
    "Add Candidate Name and Date of Photo (DOP) on passport size photo online for SSC, UPSC, Railway, Police, and government exam forms.",
};

export default function AddNameDatePhotoPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Add Name and Date on Photo"
        description="Easily print candidate name and date of photo (DOP/DOB) at the bottom of passport photos for official job applications."
      />

      <AddNameDatePhotoTool />

      <FaqSection
        centered
        items={[
          {
            q: "Why is Date of Photo (DOP) required on passport photos?",
            a: "Many recruitment agencies like SSC, IBPS, and State PSCs mandate that the photograph must not be more than 3 months old and must clearly display the candidate's name and date taken.",
          },
          {
            q: "What format will the photo download in?",
            a: "The photo downloads as a high-quality standard JPEG (.jpg) file ready to be uploaded to application portals.",
          },
        ]}
      />

      <RelatedTools slugs={["passport-size-photo", "reduce-image-size-in-kb", "resize-for-pan-card", "crop-image"]} />
    </LandingShell>
  );
}
