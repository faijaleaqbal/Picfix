import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ToolHero } from "@/components/site/sections";
import { CircleCropTool } from "./tool";

export const metadata: Metadata = {
  title: "Circle Crop",
  description: "Crop images into perfect circles.",
};

export default function CircleCropPage() {
  return (
    <LandingShell>
      <ToolHero headline="Circle Crop" description="Crop images into perfect circles." />
      <CircleCropTool />
    </LandingShell>
  );
}
