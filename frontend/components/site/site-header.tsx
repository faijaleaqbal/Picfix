"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
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
    <nav className="sticky top-0 z-50 w-full bg-[#4956a5] shadow-[0_4px_5px_-1px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex h-[58px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline">
          <div className="flex size-8 items-center justify-center rounded bg-white/10 text-white">
            <Layers className="size-5 text-[#ffeb3b]" />
          </div>
          <div className="flex items-baseline gap-1.5 text-white">
            <span className="text-xl font-extrabold tracking-tight">PICFIX</span>
            <b className="text-xs font-bold uppercase tracking-wider text-white/90">IMAGE TOOL</b>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex lg:gap-2">
          <Link
            href="/"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/" && "text-[#ffeb3b]"
            )}
          >
            Home
          </Link>

          <Link
            href="/resize-image-pixel"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/resize-image-pixel" && "text-[#ffeb3b]"
            )}
          >
            Resize Image Pixel
          </Link>

          <Link
            href="/passport-size-photo"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/passport-size-photo" && "text-[#ffeb3b]"
            )}
          >
            Passport Size Photo
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
              className="flex items-center gap-1 px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]"
            >
              <span>Convert Image</span>
              <ChevronDown className="size-3.5 opacity-80" />
            </button>

            {convertDropdownOpen && (
              <div className="absolute left-0 top-full w-56 rounded-b border-t-[3px] border-[#d31b5a] bg-white p-2 shadow-[rgba(100,100,111,0.25)_0px_7px_29px_0px]">
                <Link
                  href="/jpeg-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Image To JPG
                </Link>
                <Link
                  href="/png-to-jpeg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Image to JPEG
                </Link>
                <Link
                  href="/heic-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  HEIC To JPG
                </Link>
                <Link
                  href="/webp-to-jpg"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  WebP To JPG
                </Link>
                <Link
                  href="/image-to-pdf"
                  className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-[#505050] transition-colors hover:bg-[#EFF0FA] hover:text-[#4449A6]"
                >
                  <ChevronRight className="size-3 text-[#4449A6]" />
                  Images To PDF
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/compress-image"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/compress-image" && "text-[#ffeb3b]"
            )}
          >
            Compress Image
          </Link>

          <Link
            href="/crop-image"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/crop-image" && "text-[#ffeb3b]"
            )}
          >
            Crop Image
          </Link>

          <Link
            href="/rotate-image"
            className={cn(
              "px-3 py-2 text-[14.5px] font-semibold text-white transition-colors hover:text-[#ffeb3b]",
              pathname === "/rotate-image" && "text-[#ffeb3b]"
            )}
          >
            Rotate Image
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex flex-col justify-center gap-1.5 p-2 md:hidden text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span
            className={cn(
              "h-0.5 w-6 bg-white transition-transform duration-200",
              mobileMenuOpen && "translate-y-2 rotate-45"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-6 bg-white transition-opacity duration-200",
              mobileMenuOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-6 bg-white transition-transform duration-200",
              mobileMenuOpen && "-translate-y-2 -rotate-45"
            )}
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[58px] z-50 overflow-y-auto bg-[#4956a5] p-6 text-white md:hidden">
          <div className="flex flex-col gap-4 text-base font-semibold">
            <Link href="/" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Home
            </Link>
            <Link href="/compress-image" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Compress Image (Reduce in KB)
            </Link>
            <Link href="/resize-image-pixel" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Resize Image Pixel
            </Link>
            <Link href="/passport-size-photo" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Passport Size Photo
            </Link>
            <Link href="/crop-image" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Crop Image
            </Link>
            <Link href="/circle-crop" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Circle Crop
            </Link>
            <Link href="/rotate-image" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Rotate Image
            </Link>
            <Link href="/flip-image" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Flip Image
            </Link>
            <Link href="/image-to-pdf" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Images to PDF
            </Link>
            <Link href="/heic-to-jpg" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              HEIC to JPG
            </Link>
            <Link href="/jpeg-to-jpg" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              Image to JPG
            </Link>
            <Link href="/ai-enhance-image" className="border-l-2 border-white pl-3 hover:text-[#ffeb3b]">
              AI Photo Enhancer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
