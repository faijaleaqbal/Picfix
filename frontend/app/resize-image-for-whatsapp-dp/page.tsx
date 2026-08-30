import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/site/page-shells";
import { WorkbenchSidebar } from "@/components/site/workbench-sidebar";
import { WhatsappDpTool } from "./tool";

export const metadata: Metadata = {
  title: "WhatsApp DP Resize",
  description:
    "Perfectly size your profile picture without cropping out the important parts.",
};

export default function ResizeImageForWhatsappDpPage() {
  return (
    <WorkspaceShell sidebar={<WorkbenchSidebar activeItem="Adjust" />}>
      <WhatsappDpTool />
    </WorkspaceShell>
  );
}
