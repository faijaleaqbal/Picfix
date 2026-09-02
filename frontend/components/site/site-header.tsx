"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Wand2,
  LogIn,
  ArrowRight,
  Shield,
} from "lucide-react";
import { TOOLS, TOOL_GROUPS } from "@/lib/tools";
import { cn } from "@/lib/utils";

/**
 * Shared top navigation bar used by every page.
 * Features:
 * - Official Picfix branding
 * - Fully responsive desktop navigation with Tools dropdown
 * - Touch-friendly mobile hamburger drawer with categorized tool links
 * - Interactive Auth / Sign In modal state
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand + Desktop Navigation */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2 font-headline-md text-headline-md font-extrabold tracking-tight text-primary transition-opacity hover:opacity-90"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-lavender to-secondary text-surface shadow-sm transition-transform group-hover:scale-105">
                <Wand2 className="size-5 text-surface-dim" />
              </div>
              <span className="bg-gradient-to-r from-primary via-primary to-accent-lavender bg-clip-text text-transparent">
                Picfix
              </span>
              <span className="hidden rounded-full bg-accent-lavender/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-lavender ring-1 ring-inset ring-accent-lavender/30 sm:inline-block">
                AI
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className={cn(
                  "rounded-md px-3 py-2 font-label-md text-label-md transition-colors",
                  pathname === "/"
                    ? "font-semibold text-accent-lavender"
                    : "text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                Home
              </Link>

              {/* Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setToolsDropdownOpen((prev) => !prev)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 font-label-md text-label-md transition-colors",
                    toolsDropdownOpen || pathname !== "/"
                      ? "bg-muted text-primary"
                      : "text-text-secondary hover:bg-muted hover:text-primary"
                  )}
                  aria-expanded={toolsDropdownOpen}
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      toolsDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[520px] rounded-2xl border border-border bg-surface p-4 shadow-xl ring-1 ring-white/5">
                    <div className="mb-3 flex items-center justify-between border-b border-border pb-2 px-1">
                      <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
                        All Image Tools (21)
                      </span>
                      <Link
                        href="/"
                        onClick={() => setToolsDropdownOpen(false)}
                        className="text-xs text-accent-lavender hover:underline"
                      >
                        View all tools →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                      {TOOLS.map((t) => {
                        const Icon = t.icon;
                        const isCurrent = pathname === `/${t.slug}`;
                        return (
                          <Link
                            key={t.slug}
                            href={`/${t.slug}`}
                            onClick={() => setToolsDropdownOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg p-2 text-sm transition-colors",
                              isCurrent
                                ? "bg-accent-lavender/15 text-accent-lavender font-medium"
                                : "text-text-secondary hover:bg-muted hover:text-primary"
                            )}
                          >
                            <Icon className="size-4 shrink-0 text-accent-lavender" />
                            <span className="truncate">{t.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/templates"
                className={cn(
                  "rounded-md px-3 py-2 font-label-md text-label-md transition-colors",
                  pathname === "/templates"
                    ? "font-semibold text-accent-lavender"
                    : "text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                Templates
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "rounded-md px-3 py-2 font-label-md text-label-md transition-colors",
                  pathname === "/pricing"
                    ? "font-semibold text-accent-lavender"
                    : "text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                Pricing
              </Link>
              <Link
                href="/resources"
                className={cn(
                  "rounded-md px-3 py-2 font-label-md text-label-md transition-colors",
                  pathname === "/resources"
                    ? "font-semibold text-accent-lavender"
                    : "text-text-secondary hover:bg-muted hover:text-primary"
                )}
              >
                Resources
              </Link>
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full border border-border px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
            >
              Sign In
            </button>
            <Link
              href="/compress-image"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
            >
              <span>Get Started</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/compress-image"
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Start
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-primary transition-colors hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-xl md:hidden">
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-headline-md text-headline-md font-black tracking-tight text-primary"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-lavender to-secondary text-surface">
                <Wand2 className="size-4 text-surface-dim" />
              </div>
              <span>Picfix</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-primary"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border bg-surface p-3 font-label-md text-label-md text-primary"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border bg-surface p-3 font-label-md text-label-md text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/templates"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border bg-surface p-3 font-label-md text-label-md text-primary"
              >
                Templates
              </Link>
              <Link
                href="/resources"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-border bg-surface p-3 font-label-md text-label-md text-primary"
              >
                Resources
              </Link>
            </div>

            {/* Categorized Tools Directory */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Sparkles className="size-4 text-accent-lavender" />
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
                  All Image Tools
                </h3>
              </div>

              {TOOL_GROUPS.map((group) => {
                const groupTools = TOOLS.filter((t) => t.group === group.id);
                return (
                  <div key={group.id} className="space-y-2">
                    <h4 className="font-label-sm text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {groupTools.map((tool) => {
                        const Icon = tool.icon;
                        const isCurrent = pathname === `/${tool.slug}`;
                        return (
                          <Link
                            key={tool.slug}
                            href={`/${tool.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                              isCurrent
                                ? "bg-accent-lavender/15 text-accent-lavender font-semibold"
                                : "text-text-secondary hover:bg-muted hover:text-primary"
                            )}
                          >
                            <Icon className="size-4 shrink-0 text-accent-lavender" />
                            <span className="flex-1">{tool.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="border-t border-border bg-surface p-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted py-3 font-label-md text-label-md text-primary"
            >
              <LogIn className="size-4" />
              <span>Sign In</span>
            </button>
            <Link
              href="/compress-image"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Auth Modal (UI Feedback for Sign In / Get Started) */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent-lavender/20 text-accent-lavender">
                  <Shield className="size-4" />
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">
                  Sign in to Picfix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-lg p-1 text-text-secondary hover:bg-muted hover:text-primary"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="font-body-md text-sm text-text-secondary">
              Save your processed images, configure custom presets, and access unlimited high-resolution exports.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => alert("Authentication system integration is pending backend auth provider configuration. See FRONTEND_PRODUCT_GAP_REPORT.md")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-container-high px-4 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Authentication system integration is pending backend auth provider configuration. See FRONTEND_PRODUCT_GAP_REPORT.md")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-container-high px-4 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-muted"
              >
                <svg className="size-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="rounded-xl border border-accent-lavender/30 bg-accent-lavender/10 p-3 text-xs text-text-secondary">
              <span className="font-semibold text-accent-lavender">Notice:</span> User accounts and cloud sync are currently under active design. Guest editing with all 21 tools is 100% free with no account required.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
