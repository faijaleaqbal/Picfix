import Link from "next/link";
import { TOOLS } from "@/lib/tools";

/**
 * Shared footer used by every page.
 * Follows the majority structure: brand block + legal/support link columns.
 */
export function SiteFooter() {
  const featuredTools = TOOLS.slice(0, 6);

  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto grid max-w-container-max grid-cols-2 gap-stack-lg px-gutter py-stack-lg md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 mb-4 lg:col-span-1 lg:mb-0">
          <Link
            href="/"
            className="mb-2 block font-headline-md text-headline-md font-bold text-primary"
          >
            Picfix
          </Link>
          <p className="font-label-sm text-label-sm text-text-secondary">
            Professional grade image processing tools for modern workflows.
          </p>
          <p className="mt-2 font-label-sm text-label-sm text-text-secondary">
            © 2024-2026 Picfix AI. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-1 font-label-md text-label-md text-primary">Product</h4>
          {featuredTools.slice(0, 3).map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="text-text-secondary transition-colors hover:text-primary"
            >
              {tool.title}
            </Link>
          ))}
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Templates
          </Link>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Pricing
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-1 font-label-md text-label-md text-primary">Legal</h4>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Cookie Settings
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-1 font-label-md text-label-md text-primary">Support</h4>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="text-text-secondary transition-colors hover:text-primary"
          >
            API Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
