import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { FlipTool } from "./tool";

export const metadata: Metadata = {
  title: "Flip Image",
  description: "Mirror images horizontally or vertically.",
};

export default function FlipImagePage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Adjust" />}>
      <FlipTool />
    </WorkspaceShell>
  );
}
