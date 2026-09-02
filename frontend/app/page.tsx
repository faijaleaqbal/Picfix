"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

interface ToolItem {
  title: string;
  href: string;
  category: string;
}

const ALL_TOOLS: ToolItem[] = [
  // Most Used Tools
  { title: "Passport Photo Maker", href: "/passport-size-photo", category: "Most Used Tools" },
  { title: "Reduce Image Size in KB", href: "/reduce-image-size-in-kb", category: "Most Used Tools" },
  { title: "Merge PDF", href: "/merge-pdf", category: "Most Used Tools" },
  { title: "Compress PDF", href: "/compress-pdf", category: "Most Used Tools" },
  { title: "Split PDF", href: "/split-pdf", category: "Most Used Tools" },
  { title: "PDF to JPG", href: "/pdf-to-jpg", category: "Most Used Tools" },
  { title: "Unlock PDF (Remove Password)", href: "/unlock-pdf", category: "Most Used Tools" },
  { title: "Resize Image Pixel", href: "/resize-image-pixel", category: "Most Used Tools" },
  { title: "Add Name and Date on Photo", href: "/add-name-and-date-on-photo", category: "Most Used Tools" },
  { title: "Merge Photo and Signature", href: "/merge-photo-and-signature", category: "Most Used Tools" },
  { title: "Remove Image Background", href: "/remove-image-background", category: "Most Used Tools" },
  { title: "AI Watermark Remover", href: "/ai-remove-watermark", category: "Most Used Tools" },
  { title: "AI Image to Text (OCR)", href: "/image-to-text", category: "Most Used Tools" },
  { title: "Change Photo Background", href: "/change-photo-background", category: "Most Used Tools" },
  { title: "Images To PDF", href: "/image-to-pdf", category: "Most Used Tools" },
  { title: "AI Photo Enhancer", href: "/ai-enhance-image", category: "Most Used Tools" },
  { title: "Resize Image In Centimeter", href: "/resize-image-in-cm", category: "Most Used Tools" },
  { title: "PAN Card Resize", href: "/resize-for-pan-card", category: "Most Used Tools" },
  { title: "SSC Photo Resizer", href: "/ssc-photo-resizer", category: "Most Used Tools" },
  { title: "Crop Image", href: "/crop-image", category: "Most Used Tools" },
  { title: "Rotate Image", href: "/rotate-image", category: "Most Used Tools" },

  // Basic Editing
  { title: "Crop Image", href: "/crop-image", category: "Basic Editing" },
  { title: "Circle Crop", href: "/circle-crop", category: "Basic Editing" },
  { title: "Square Crop", href: "/square-image-cropper", category: "Basic Editing" },
  { title: "Rotate Image", href: "/rotate-image", category: "Basic Editing" },
  { title: "Flip Image", href: "/flip-image", category: "Basic Editing" },
  { title: "Watermark Images", href: "/watermark-image", category: "Basic Editing" },
  { title: "Add Text to Image", href: "/add-text-to-image", category: "Basic Editing" },
  { title: "Add Logo to Image", href: "/add-logo-to-image", category: "Basic Editing" },
  { title: "Grayscale Image", href: "/grayscale-image", category: "Basic Editing" },
  { title: "Blur Image", href: "/blur-image", category: "Basic Editing" },
  { title: "Color Code From Image", href: "/color-code-from-image", category: "Basic Editing" },

  // Format Conversions
  { title: "Image to JPG", href: "/jpeg-to-jpg", category: "Format Conversions" },
  { title: "HEIC to JPG", href: "/heic-to-jpg", category: "Format Conversions" },
  { title: "WebP to JPG", href: "/webp-to-jpg", category: "Format Conversions" },
  { title: "PNG to JPEG", href: "/png-to-jpeg", category: "Format Conversions" },
  { title: "Images To PDF", href: "/image-to-pdf", category: "Format Conversions" },

  // Official & Exam Resizing
  { title: "Passport Size Photo", href: "/passport-size-photo", category: "Official & Exam Sizing" },
  { title: "Add Name and Date on Photo", href: "/add-name-and-date-on-photo", category: "Official & Exam Sizing" },
  { title: "Merge Photo and Signature", href: "/merge-photo-and-signature", category: "Official & Exam Sizing" },
  { title: "SSC Photo Resizer (20-50KB)", href: "/ssc-photo-resizer", category: "Official & Exam Sizing" },
  { title: "PAN Card Resize", href: "/resize-for-pan-card", category: "Official & Exam Sizing" },
  { title: "Resize Image in CM", href: "/resize-image-in-cm", category: "Official & Exam Sizing" },
  { title: "Resize Image by Pixel", href: "/resize-image-pixel", category: "Official & Exam Sizing" },
  { title: "Instagram Resize (No Crop)", href: "/resize-image-for-instagram", category: "Official & Exam Sizing" },
  { title: "WhatsApp DP Resize", href: "/resize-image-for-whatsapp-dp", category: "Official & Exam Sizing" },

  // Target KB Compression
  { title: "Reduce Size in KB", href: "/reduce-image-size-in-kb", category: "Target KB Compression" },
  { title: "Compress Image to 20KB", href: "/compress-image-to-20kb", category: "Target KB Compression" },
  { title: "Compress Image to 50KB", href: "/compress-image-to-50kb", category: "Target KB Compression" },
  { title: "Compress Image to 100KB", href: "/compress-image-to-100kb", category: "Target KB Compression" },
  { title: "Compress Image to 200KB", href: "/compress-image-to-200kb", category: "Target KB Compression" },
  { title: "Compress Image to 500KB", href: "/compress-image-to-500kb", category: "Target KB Compression" },
  // PDF Tools 
  { title: "Merge PDF", href: "/merge-pdf", category: "PDF Tools" },
  { title: "Split PDF", href: "/split-pdf", category: "PDF Tools" },
  { title: "Compress PDF", href: "/compress-pdf", category: "PDF Tools" },
  { title: "Compress PDF to 100KB", href: "/compress-pdf-to-100kb", category: "PDF Tools" },
  { title: "Compress PDF to 200KB", href: "/compress-pdf-to-200kb", category: "PDF Tools" },
  { title: "Compress PDF to 300KB", href: "/compress-pdf-to-300kb", category: "PDF Tools" },
  { title: "Compress PDF to 500KB", href: "/compress-pdf-to-500kb", category: "PDF Tools" },
  { title: "Compress PDF to 1MB", href: "/compress-pdf-to-1mb", category: "PDF Tools" },
  { title: "PDF to JPG", href: "/pdf-to-jpg", category: "PDF Tools" },
  { title: "PDF to PNG", href: "/pdf-to-png", category: "PDF Tools" },
  { title: "Images to PDF", href: "/image-to-pdf", category: "PDF Tools" },
  { title: "Crop PDF", href: "/crop-pdf", category: "PDF Tools" },
  { title: "Rotate PDF", href: "/rotate-pdf", category: "PDF Tools" },
  { title: "Grayscale PDF", href: "/grayscale-pdf", category: "PDF Tools" },
  { title: "Organize PDF", href: "/organize-pdf", category: "PDF Tools" },
  { title: "PDF Metadata Editor", href: "/pdf-metadata", category: "PDF Tools" },
  { title: "Add Page Numbers", href: "/add-page-numbers-pdf", category: "PDF Tools" },
  { title: "Watermark PDF", href: "/watermark-pdf", category: "PDF Tools" },
  { title: "Remove PDF Pages", href: "/remove-pages-pdf", category: "PDF Tools" },
  { title: "Unlock PDF (Remove Password)", href: "/unlock-pdf", category: "PDF Tools" },
  // AI Tools
  { title: "AI Watermark Remover", href: "/ai-remove-watermark", category: "AI Tools" },
  { title: "AI Background Remover", href: "/remove-image-background", category: "AI Tools" },
  { title: "AI Image to Text (OCR)", href: "/image-to-text", category: "AI Tools" },
  { title: "Change Photo Background", href: "/change-photo-background", category: "AI Tools" },
  { title: "AI Smart Face Crop", href: "/ai-face-crop", category: "AI Tools" },
  { title: "AI Photo Enhancer", href: "/ai-enhance-image", category: "AI Tools" },
];

const CATEGORIES = [
  "Most Used Tools",
  "AI Tools",
  "PDF Tools",
  "Official & Exam Sizing",
  "Target KB Compression",
  "Basic Editing",
  "Format Conversions",
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return ALL_TOOLS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#2b2f52]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1240px] flex-grow px-4 py-8 sm:px-6">
        {/* Main Title */}
        <h1 className="text-center text-2xl font-bold tracking-tight text-[#2b2f52] sm:text-3xl md:text-4xl">
          Compress, Resize & Edit Pictures
        </h1>

        {/* Pi7 Search Bar */}
        <div className="mx-auto my-6 max-w-xl rounded-md bg-[#eff0fa] p-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-[#4449A6] opacity-75" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tool (e.g. compress, passport, ssc, signature, crop)..."
              className="w-full rounded bg-white py-2 pl-10 pr-4 text-sm text-[#2b2f52] outline-none shadow-sm transition-all focus:ring-2 focus:ring-[#4449A6]/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Results if query entered */}
        {filteredTools ? (
          <section className="my-6">
            <h3 className="mb-3 flex items-center border-l-4 border-[#4449A6] pl-2.5 text-base font-bold text-[#4449A6] sm:text-lg">
              Search Results ({filteredTools.length})
            </h3>
            {filteredTools.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No tools found matching &ldquo;{searchQuery}&rdquo;. Try another search keyword.
              </p>
            ) : (
              <div className="toolcontainer">
                {filteredTools.map((tool, idx) => (
                  <Link key={`${tool.href}-${idx}`} href={tool.href} className="trackbtn">
                    {tool.title}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Pi7 Categorized Tool Sections */
          <div className="my-6 space-y-7 sm:space-y-8">
            {CATEGORIES.map((cat) => {
              const tools = ALL_TOOLS.filter((t) => t.category === cat);
              return (
                <section key={cat} className="space-y-2.5 sm:space-y-3">
                  <h3 className="flex items-center border-l-4 border-[#4449A6] pl-2.5 text-base font-bold text-[#4449A6] sm:text-lg">
                    {cat}
                  </h3>
                  <div className="toolcontainer">
                    {tools.map((tool, idx) => (
                      <Link key={`${tool.href}-${idx}`} href={tool.href} className="trackbtn">
                        {tool.title}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Privacy & Fast Processing Assurance Banner */}
        <section className="my-12 rounded-lg border border-[#d9dcea] bg-[#fafbfe] p-6 text-center sm:p-8">
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#EFF0FA] text-[#4449A6]">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-[#2b2f52]">
              100% Free, Fast & Private Image Processing
            </h2>
            <p className="text-xs leading-relaxed text-[#6e7288] sm:text-sm">
              Rest assured, your images are processed swiftly and automatically removed from temporary memory after 30 minutes. We never store or train models on user images.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
