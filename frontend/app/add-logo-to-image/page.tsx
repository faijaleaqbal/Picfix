import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { AddLogoTool } from "./tool";

export const metadata: Metadata = {
  title: "Add Logo to Image",
  description: "Embed your brand mark with precision.",
};

export default function AddLogoToImagePage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Add Logo" />}>
      <AddLogoTool />
    </WorkspaceShell>
  );
}
