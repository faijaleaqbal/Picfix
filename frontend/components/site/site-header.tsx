import Link from "next/link";

/**
 * Shared top navigation bar used by every page.
 * Canonical structure (majority of the 21 Stitch exports):
 * brand + nav links (Editor active) + Sign In / Get Started buttons.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-gutter">
        <div className="flex items-center gap-stack-lg">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold tracking-tighter text-primary"
          >
            LuminaEdit
          </Link>
          <nav className="hidden gap-stack-md md:flex">
            <Link
              href="/"
              className="font-body-md text-body-md border-b-2 border-accent-lavender px-3 py-2 font-bold text-primary"
            >
              Editor
            </Link>
            <Link
              href="/"
              className="text-text-secondary hover:bg-muted rounded-md px-3 py-2 font-body-md text-body-md transition-colors hover:text-primary"
            >
              Templates
            </Link>
            <Link
              href="/"
              className="text-text-secondary hover:bg-muted rounded-md px-3 py-2 font-body-md text-body-md transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/"
              className="text-text-secondary hover:bg-muted rounded-md px-3 py-2 font-body-md text-body-md transition-colors hover:text-primary"
            >
              Resources
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-stack-md">
          <button className="hidden rounded-full border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted md:block">
            Sign In
          </button>
          <button className="rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-tertiary-fixed-dim">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
