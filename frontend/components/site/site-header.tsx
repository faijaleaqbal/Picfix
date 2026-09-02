"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Layers, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pi7-identical top navigation bar
 * Background: #4956a5
 * Hover: #ffeb3b
 * Dropdown: White with top border #d31b5a
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const convertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setConvertDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (convertRef.current && !convertRef.current.contains(e.target as Node)) {
        setConvertDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#4956a5] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex h-14 sm:h-[58px] max-w-[1240px] items-center justify-between px-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-white no-underline">
          <div className="flex size-7 sm:size-8 items-center justify-center rounded bg-white/10 text-[#ffeb3b]">
            <Layers className="size-4 sm:size-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">PICFIX</span>
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white/90">IMAGE TOOL</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-0.5 md:flex lg:gap-1.5">
          <Link
            href="/"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/" && "text-[#ffeb3b]"
            )}
          >
            Home
          </Link>

          <Link
            href="/reduce-image-size-in-kb"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              (pathname === "/reduce-image-size-in-kb" || pathname === "/compress-image") && "text-[#ffeb3b]"
            )}
          >
            Reduce in KB
          </Link>

          <Link
            href="/resize-image-pixel"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/resize-image-pixel" && "text-[#ffeb3b]"
            )}
          >
            Resize Pixel
          </Link>

          <Link
            href="/passport-size-photo"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/passport-size-photo" && "text-[#ffeb3b]"
            )}
          >
            Passport Photo
          </Link>

          {/* Convert Image Dropdown */}
          <div
            className="relative"
            ref={convertRef}
            onMouseEnter={() => setConvertDropdownOpen(true)}
            onMouseLeave={() => setConvertDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setConvertDropdownOpen((v) => !v)}
              className="flex items-center gap-1 rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]"
            >
              <span>Convert</span>
              <ChevronDown className="size-3.5 opacity-80" />
            </button>

            {convertDropdownOpen && (
              <div className="absolute left-0 top-full w-52 rounded-b border-t-[3px] border-[#d31b5a] bg-white p-2 shadow-xl">
                <Link
                  href="/jpeg-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Image To JPG
                </Link>
                <Link
                  href="/png-to-jpeg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Image to JPEG
                </Link>
                <Link
                  href="/heic-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  HEIC To JPG
                </Link>
                <Link
                  href="/webp-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  WebP To JPG
                </Link>
                <Link
                  href="/image-to-pdf"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Images To PDF
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/crop-image"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/crop-image" && "text-[#ffeb3b]"
            )}
          >
            Crop Image
          </Link>

          <Link
            href="/rotate-image"
            className={cn(
              "rounded px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/rotate-image" && "text-[#ffeb3b]"
            )}
          >
            Rotate Image
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded text-white hover:bg-white/10 md:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[54px] z-50 overflow-y-auto bg-[#4956a5] p-5 text-white shadow-2xl md:hidden">
          <div className="space-y-6 pb-12">
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ffeb3b]">
                Popular Tools
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link
                  href="/reduce-image-size-in-kb"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Reduce Size in KB
                </Link>
                <Link
                  href="/resize-image-pixel"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Resize Pixel
                </Link>
                <Link
                  href="/passport-size-photo"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Passport Photo
                </Link>
                <Link
                  href="/remove-image-background"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Remove Background
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ffeb3b]">
                Govt Exam & Official Tools
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link
                  href="/add-name-and-date-on-photo"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Name & Date on Photo
                </Link>
                <Link
                  href="/merge-photo-and-signature"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Merge Photo & Sign
                </Link>
                <Link
                  href="/ssc-photo-resizer"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  SSC Photo Resizer
                </Link>
                <Link
                  href="/resize-for-pan-card"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  PAN Card Resize
                </Link>
                <Link
                  href="/increase-image-size-in-kb"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Increase Size in KB
                </Link>
                <Link
                  href="/resize-image-in-cm"
                  className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20 hover:text-[#ffeb3b]"
                >
                  Resize in CM
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ffeb3b]">
                Crop & Editing
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/crop-image" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Crop Image
                </Link>
                <Link href="/circle-crop" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Circle Crop
                </Link>
                <Link href="/rotate-image" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Rotate Image
                </Link>
                <Link href="/flip-image" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Flip Image
                </Link>
                <Link href="/blur-image" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Blur Image
                </Link>
                <Link href="/color-code-from-image" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Color Picker
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ffeb3b]">
                Conversions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/image-to-pdf" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Images to PDF
                </Link>
                <Link href="/jpeg-to-jpg" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  Image to JPG
                </Link>
                <Link href="/heic-to-jpg" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  HEIC to JPG
                </Link>
                <Link href="/webp-to-jpg" className="rounded bg-white/10 p-2.5 font-medium hover:bg-white/20">
                  WebP to JPG
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
