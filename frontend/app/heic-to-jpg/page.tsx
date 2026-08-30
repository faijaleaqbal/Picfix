import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { HeicToJpgTool } from "./tool";

export const metadata: Metadata = {
  title: "HEIC to JPG",
  description: "Make iPhone photos universal and easy to share.",
};

export default function HeicToJpgPage() {
  return (
    <LandingShell mainClassName="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-stack-lg">
        {/* Tool Header */}
        <header className="space-y-2 text-center">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-primary md:font-headline-xl md:text-headline-xl">
            HEIC to JPG
          </h1>
          <p className="font-body-lg text-body-lg text-text-secondary">
            Make iPhone photos universal and easy to share.
          </p>
        </header>

        {/* Converter Card */}
        <HeicToJpgTool />
      </div>
    </LandingShell>
  );
}
