"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Wand2,
  SlidersHorizontal,
  Type,
  Maximize2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkbenchSidebarProps {
  /** Label of the currently active tool (receives the highlighted state) */
  activeItem?: string;
  className?: string;
}

const STUDIO_TOOLS = [
  { label: "Adjust", icon: SlidersHorizontal, href: "/rotate-image", desc: "Rotate, flip & align" },
  { label: "Filters", icon: Wand2, href: "/grayscale-image", desc: "B&W & color tones" },
  { label: "Retouch", icon: Sparkles, href: "/ai-enhance-image", desc: "AI quality boost" },
  { label: "Text", icon: Type, href: "/add-text-to-image", desc: "Captions & titles" },
  { label: "Add Logo", icon: Camera, href: "/add-logo-to-image", desc: "Brand watermark" },
  { label: "Social", icon: Maximize2, href: "/resize-image-for-instagram", desc: "Feed & DP sizes" },
  { label: "All Tools", icon: FolderOpen, href: "/", desc: "Directory of 21 tools" },
];

/**
 * Shared "Picfix Studio" side navigation used by the editor-style pages.
 * Responsive design:
 * - Desktop (>= 1024px): Full w-60 drawer, collapsible to w-16 icon rail
 * - Tablet (768px - 1023px): Automatically starts in compact w-16 rail to give canvas maximum space
 * - Mobile (< 768px): Hidden from horizontal layout; accessible via header mobile drawer
 */
export function WorkbenchSidebar({ activeItem = "Adjust", className }: WorkbenchSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:flex",
        collapsed ? "w-16" : "w-16 lg:w-60",
        className
      )}
    >
      {/* Studio Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <div className="hidden lg:block truncate">
            <h2 className="font-label-md text-sm font-bold tracking-tight text-primary">
              Picfix Studio
            </h2>
            <p className="font-mono text-[10px] text-accent-lavender">v2.4 Pro</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mx-auto flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-muted hover:text-primary"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Tool Navigation List */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {STUDIO_TOOLS.map((item) => {
          const active =
            item.label.toLowerCase() === activeItem.toLowerCase() ||
            pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 font-label-md text-label-md transition-colors",
                active
                  ? "bg-accent-lavender/15 font-semibold text-accent-lavender"
                  : "text-text-secondary hover:bg-muted hover:text-primary"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && (
                <div className="hidden min-w-0 flex-1 lg:block">
                  <div className="truncate">{item.label}</div>
                  <div className="truncate text-[10px] text-text-secondary font-normal group-hover:text-primary">
                    {item.desc}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="mt-auto flex flex-col gap-1 border-t border-border p-2">
        <Link
          href="/pricing"
          title="Upgrade Plan"
          className={cn(
            "flex items-center justify-center rounded-xl border border-accent-lavender/40 bg-accent-lavender/10 py-2 font-label-sm text-xs font-semibold text-accent-lavender transition-colors hover:bg-accent-lavender/20",
            collapsed && "px-0"
          )}
        >
          {!collapsed ? (
            <span className="hidden lg:inline">Upgrade Plan</span>
          ) : null}
          <Sparkles className={cn("size-4", !collapsed && "lg:hidden")} />
        </Link>

        <Link
          href="/pricing"
          title="Settings"
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 font-label-sm text-xs text-text-secondary transition-colors hover:bg-muted hover:text-primary"
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span className="hidden lg:inline">Settings</span>}
        </Link>

        <Link
          href="/resources"
          title="Help & Documentation"
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 font-label-sm text-xs text-text-secondary transition-colors hover:bg-muted hover:text-primary"
        >
          <HelpCircle className="size-4 shrink-0" />
          {!collapsed && <span className="hidden lg:inline">Help</span>}
        </Link>

        {!collapsed && (
          <div className="hidden border-t border-border/50 px-2 pt-2 text-[11px] text-text-secondary lg:block">
            <span className="flex items-center gap-1.5 text-accent-lavender">
              <Sparkles className="size-3" />
              Powered by Picfix AI
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
