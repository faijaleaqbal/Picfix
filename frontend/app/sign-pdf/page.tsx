import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { SignPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Sign PDF Online | eSign PDF Documents | iLovePDF Alternative",
  description:
    "Sign PDF online with your digital signature image. Simple, fast and legally binding e-signature tool.",
};

export default function SignPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Sign PDF Online"
        description="Sign agreements, contracts, and documents by placing your signature image onto PDF pages."
      />

      <SignPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "What signature format is best?",
            a: "A PNG file with a transparent background works best so only your ink signature appears over the document text.",
          },
          {
            q: "Can I choose which page to sign?",
            a: "Yes! Specify the target page number (e.g. Page 1 or final signature page) in the settings panel.",
          },
        ]}
      />

      <RelatedTools slugs={["merge-pdf", "compress-pdf", "watermark-pdf", "add-page-numbers-pdf"]} />
    </LandingShell>
  );
}
