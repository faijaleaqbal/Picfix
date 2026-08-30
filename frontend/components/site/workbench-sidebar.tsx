"use client";

import { Sparkles, Wand2, Layers, Smile, SlidersHorizontal, Share, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkbenchSidebarProps {
  /** Label of the currently active tool (receives the highlighted state) */
  activeItem?: string;
}

const ITEMS = [
  { label: "Adjust", icon: SlidersHorizontal },
  { label: "Filters", icon: Wand2 },
  { label: "Retouch", icon: Smile },
  { label: "Layers", icon: Layers },
  { label: "Export", icon: Share },
];

/**
 * Shared "Workbench" side navigation used by the editor-style pages.
 * (Identical structure across all exports: title, v2.4 Pro badge, tool
 * list with one highlighted item, upgrade CTA, settings/help links.)
 */
export function WorkbenchSidebar({ activeItem = "Adjust" }: WorkbenchSidebarProps) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col gap-stack-sm border-r border-outline-variant bg-surface py-stack-md md:flex">
      <div className="mb-stack-sm px-gutter">
        <h2 className="font-headline-sm text-headline-sm font-black tracking-tighter text-accent-lavender">
          Workbench
        </h2>
        <p className="mt-1 font-label-sm text-label-sm text-text-secondary">v2.4 Pro</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {ITEMS.map((item) => {
          const active = item.label === activeItem;
          return (
            <a
              key={item.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-colors duration-200",
                active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-text-secondary hover:bg-muted hover:text-on-surface"
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-outline-variant px-2 pt-4">
        <button className="mb-2 w-full rounded-full border border-accent-lavender py-2 font-label-md text-label-md text-accent-lavender transition-colors hover:bg-accent-lavender/10">
          Upgrade Plan
        </button>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md text-text-secondary transition-colors hover:bg-muted hover:text-on-surface"
        >
          <Settings className="size-5" />
          <span>Settings</span>
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md text-text-secondary transition-colors hover:bg-muted hover:text-on-surface"
        >
          <HelpCircle className="size-5" />
          <span>Help</span>
        </a>
        <div className="px-2 pb-2 pt-1">
          <span className="flex items-center gap-2 font-label-sm text-label-sm text-text-secondary">
            <Sparkles className="size-4 text-accent-lavender" />
            Powered by LuminaEdit AI
          </span>
        </div>
      </div>
    </aside>
  );
}
