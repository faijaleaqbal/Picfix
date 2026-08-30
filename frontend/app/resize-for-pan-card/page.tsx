import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { PanCardTool } from "./tool";

export const metadata: Metadata = {
  title: "PAN Card Resize",
  description:
    "Specific sizing for ID card applications. Standard dimensions (213x213px) with file size limits.",
};

export default function ResizeForPanCardPage() {
  return (
    <LandingShell mainClassName="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <PanCardTool />
      </div>
    </LandingShell>
  );
}
