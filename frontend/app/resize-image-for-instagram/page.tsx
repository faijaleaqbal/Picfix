import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { InstagramResizeTool } from "./tool";

export const metadata: Metadata = {
  title: "Instagram Resize",
  description: "Optimize images for feed, stories, or profile pictures.",
};

export default function ResizeImageForInstagramPage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Adjust" />}>
      <InstagramResizeTool />
    </WorkspaceShell>
  );
}
