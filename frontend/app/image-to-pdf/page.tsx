import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { ImageToPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Image to PDF",
  description: "Compile multiple images into a single document.",
};

export default function ImageToPdfPage() {
  return (
    <LandingShell mainClassName="mx-auto flex w-full max-w-container-max flex-grow gap-gutter px-margin-mobile py-stack-lg md:px-gutter">
      <ImageToPdfTool />
    </LandingShell>
  );
}
