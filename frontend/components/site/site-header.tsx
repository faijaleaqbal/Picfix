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
  ArrowRight,
} from "lucide-react";
import { TOOLS, TOOL_GROUPS } from "@/lib/tools";
import { cn } from "@/lib/utils";

/**
 * Shared top navigation bar used by every page.
 * Features:
 * - Official Picfix branding
 * - Fully responsive desktop navigation with Tools dropdown
 * - Touch-friendly mobile hamburger drawer with categorized tool links
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
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
            <span className="hidden lg:inline-flex items-center rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-text-secondary border border-border">
              100% Free Tools
            </span>
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
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted py-3 font-label-md text-label-md text-primary"
            >
              <span>Explore All Tools</span>
            </Link>
            <Link
              href="/compress-image"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary"
            >
              <span>Start Editing Free</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
