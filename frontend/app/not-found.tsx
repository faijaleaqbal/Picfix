import Link from "next/link";
import { LandingShell } from "@/components/site/page-shells";
import {
  Home,
  Sparkles,
  Image as ImageIcon,
  FileText,
  ScanFace,
  Wand2,
  FileCheck,
  Search,
} from "lucide-react";


export const metadata = {
  title: "404 - Page Not Found | Picfix",
  description: "Sorry, the page you are looking for does not exist on Picfix Image Tool.",
};

const popularTools = [
  {
    name: "Compress Image",
    desc: "Reduce image size in KB without losing quality",
    href: "/compress-image",
    icon: ImageIcon,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    name: "Remove Background",
    desc: "100% automatic AI background cutout",
    href: "/remove-image-background",
    icon: Wand2,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    name: "Passport Size Photo",
    desc: "Create official exam & passport photos",
    href: "/passport-size-photo",
    icon: ScanFace,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    name: "Complete PDF Suite",
    desc: "Merge, compress, unlock & edit PDFs",
    href: "/merge-pdf",
    icon: FileText,
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    name: "AI Photo Enhancer",
    desc: "Upscale and fix blurry low-res photos",
    href: "/ai-enhance-image",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    name: "Official SSC Resizer",
    desc: "Format photo & sign for Govt exams",
    href: "/ssc-photo-resizer",
    icon: FileCheck,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

export default function NotFound() {
  return (
    <LandingShell>
      <div className="mx-auto max-w-4xl py-8 md:py-16 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm mb-6">
          <span className="flex size-2 rounded-full bg-indigo-600 animate-pulse" />
          Error 404 • Page Not Found
        </div>

        {/* Large Decorative 404 Headline */}
        <div className="relative mb-6 select-none">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-[#1b223c]/10">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-extrabold text-[#1b223c]">
              Page Not Found
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mx-auto max-w-lg text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
          Oops! The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4956a5] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#3d488c] hover:shadow-lg active:scale-95"
          >
            <Home className="size-4" />
            Back to Home
          </Link>
          <Link
            href="/#tools"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95"
          >
            <Search className="size-4" />
            Explore 67+ Free Tools
          </Link>
        </div>

        {/* Popular Tools Section */}
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 text-left shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Popular Free Tools
              </h2>
              <p className="text-xs text-slate-500">
                Looking for one of our core image or PDF utilities?
              </p>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-[#4956a5] hover:underline flex items-center gap-1"
            >
              View all
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${tool.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#4956a5] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </LandingShell>
  );
}
