import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ToolHero } from "@/components/site/sections";
import { SquareCropperTool } from "./tool";

export const metadata: Metadata = {
  title: "Square Image Cropper",
  description: "Make images perfectly square for social media.",
};

export default function SquareImageCropperPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Square Cropper"
        description="Make images perfectly square for social media."
      />
      <SquareCropperTool />
    </LandingShell>
  );
}
