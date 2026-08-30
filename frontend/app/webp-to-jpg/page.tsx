import type { Metadata } from "next";
import { LandingShell } from "@/components/site/page-shells";
import { WebpToJpgTool } from "./tool";

export const metadata: Metadata = {
  title: "WebP to JPG",
  description: "Convert modern web formats for wider compatibility.",
};

export default function WebpToJpgPage() {
  return (
    <LandingShell mainClassName="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-stack-lg md:px-gutter">
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        {/* Tool Header */}
        <header className="mb-stack-lg mt-stack-md text-center">
          <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary md:text-headline-lg md:font-headline-lg">
            WebP to JPG
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-text-secondary">
            Convert modern web formats for wider compatibility.
          </p>
        </header>

        <WebpToJpgTool />
      </div>
    </LandingShell>
  );
}
