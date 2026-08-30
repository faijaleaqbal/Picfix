import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { AddTextTool } from "./tool";

export const metadata: Metadata = {
  title: "Add Text to Image",
  description: "Overlay custom typography and messaging.",
};

export default function AddTextToImagePage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Text" />}>
      <AddTextTool />
    </WorkspaceShell>
  );
}
