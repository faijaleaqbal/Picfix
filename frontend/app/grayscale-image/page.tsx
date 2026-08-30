import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { GrayscaleTool } from "./tool";

export const metadata: Metadata = {
  title: "Grayscale Image",
  description: "Convert photos to striking black and white.",
};

export default function GrayscaleImagePage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Filters" />}>
      <GrayscaleTool />
    </WorkspaceShell>
  );
}
