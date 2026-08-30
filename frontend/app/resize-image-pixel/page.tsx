import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ToolHero } from "@/components/site/sections";
import { ResizeImageTool } from "./tool";

export const metadata: Metadata = {
  title: "Resize Image",
  description:
    "Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms.",
};

/**
 * /resize-image-pixel — same component as /resize-image-in-cm; the
 * unit toggle inside the panel switches between px and cm.
 */
export default function ResizeImagePixelPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Resize Image"
        description="Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms."
      />
      <ResizeImageTool defaultUnit="px" />
    </LandingShell>
  );
}
