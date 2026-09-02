import Link from "next/link";
import { Layers } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full bg-[#4956a5] text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Privacy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded bg-white/10 text-[#ffeb3b]">
                <Layers className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">PICFIX IMAGE TOOL</span>
            </div>
            <p className="text-xs leading-relaxed text-white/90">
              Rest assured, your images are automatically removed from our server after 30 Mins of compression. Your privacy matters to us at Picfix Image Tool.
            </p>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              Popular Tools
            </h4>
            <ul className="space-y-1.5 text-xs text-white/90">
              <li>
                <Link href="/compress-image" className="transition-colors hover:text-[#ffeb3b]">
                  Reduce Image Size in KB
                </Link>
              </li>
              <li>
                <Link href="/resize-image-pixel" className="transition-colors hover:text-[#ffeb3b]">
                  Resize Image Pixel
                </Link>
              </li>
              <li>
                <Link href="/passport-size-photo" className="transition-colors hover:text-[#ffeb3b]">
                  Passport Size Photo
                </Link>
              </li>
              <li>
                <Link href="/crop-image" className="transition-colors hover:text-[#ffeb3b]">
                  Crop Image
                </Link>
              </li>
              <li>
                <Link href="/circle-crop" className="transition-colors hover:text-[#ffeb3b]">
                  Circle Crop
                </Link>
              </li>
            </ul>
          </div>

          {/* Format Conversions */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              Convert Image
            </h4>
            <ul className="space-y-1.5 text-xs text-white/90">
              <li>
                <Link href="/jpeg-to-jpg" className="transition-colors hover:text-[#ffeb3b]">
                  Image To JPG
                </Link>
              </li>
              <li>
                <Link href="/png-to-jpeg" className="transition-colors hover:text-[#ffeb3b]">
                  Image to JPEG
                </Link>
              </li>
              <li>
                <Link href="/heic-to-jpg" className="transition-colors hover:text-[#ffeb3b]">
                  HEIC To JPG
                </Link>
              </li>
              <li>
                <Link href="/webp-to-jpg" className="transition-colors hover:text-[#ffeb3b]">
                  WebP To JPG
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className="transition-colors hover:text-[#ffeb3b]">
                  Images To PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              Resources & Info
            </h4>
            <ul className="space-y-1.5 text-xs text-white/90">
              <li>
                <Link href="/resources" className="transition-colors hover:text-[#ffeb3b]">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/templates" className="transition-colors hover:text-[#ffeb3b]">
                  Dimension Templates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-[#ffeb3b]">
                  Pricing (100% Free)
                </Link>
              </li>
              <li>
                <Link href="/resources" className="transition-colors hover:text-[#ffeb3b]">
                  Privacy Policy & Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/20 pt-4 text-xs text-white/80 sm:flex-row">
          <p>© 2026 Picfix Image Tool. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made With <span className="text-red-300">♥</span> By Picfix
          </p>
        </div>
      </div>
    </footer>
  );
}
