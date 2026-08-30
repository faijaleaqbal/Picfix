import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ToolHero } from "@/components/site/sections";
import { ResizeImageTool } from "../resize-image-pixel/tool";

export const metadata: Metadata = {
  title: "Resize Image in CM",
  description:
    "Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms.",
};

/**
 * /resize-image-in-cm — the same Stitch export (resize_image) mounted
 * at a second route, defaulting the unit toggle to centimeters.
 */
export default function ResizeImageCmPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Resize Image"
        description="Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms."
      />
      <ResizeImageTool defaultUnit="cm" />
    </LandingShell>
  );
}
