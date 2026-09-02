import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { FaqSection, ToolHero } from "@/components/site/sections";
import { RelatedTools } from "@/components/site/related-tools";
import { UnlockPdfTool } from "./tool";

export const metadata: Metadata = {
  title: "Unlock PDF | Remove PDF Password Online Free | Picfix",
  description:
    "Remove password and encryption from PDF files online for free. Decrypt salary slips, bank statements, and documents securely.",
};

export default function UnlockPdfPage() {
  return (
    <LandingShell>
      <ToolHero
        headline="Unlock PDF Online"
        description="Remove password security from your PDF file so you can view, print, and share it without typing password."
      />

      <UnlockPdfTool />

      <FaqSection
        centered
        items={[
          {
            q: "Will I ever need the password again after downloading?",
            a: "No! The decrypted PDF downloaded from Picfix is permanently unlocked. You and anyone you share it with can open it immediately without any password prompt.",
          },
          {
            q: "Are my bank statements and passwords safe?",
            a: "Yes! Decryption runs completely inside your local browser sandbox. Your password and files are never transmitted to any third-party server.",
          },
          {
            q: "Can this remove passwords from Aadhaar, Payslips, and Bank PDFs?",
            a: "Yes! It works on all standard password-protected PDFs from banks (SBI, HDFC, ICICI, etc.), Aadhaar cards, and corporate payslips.",
          },
        ]}
      />

      <RelatedTools slugs={["compress-pdf", "merge-pdf", "split-pdf", "pdf-to-jpg"]} />
    </LandingShell>
  );
}
