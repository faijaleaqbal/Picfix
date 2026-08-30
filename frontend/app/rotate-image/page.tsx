import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { RotateTool } from "./tool";

export const metadata: Metadata = {
  title: "Rotate Image",
  description: "Turn images clockwise or counter-clockwise.",
};

export default function RotateImagePage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Adjust" />}>
      <RotateTool />
    </WorkspaceShell>
  );
}
