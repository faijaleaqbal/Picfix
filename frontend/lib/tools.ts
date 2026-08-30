import type { LucideIcon } from "lucide-react";
import {
  Blend,
  Camera,
  CircleDot,
  Crop,
  FileOutput,
  FileText,
  FlipHorizontal,
  Frame,
  IdCard,
  ImageDown,
  Maximize,
  Minimize2,
  Palette,
  Repeat,
  RotateCw,
  Scan,
  Sparkles,
  Square,
  Type,
  UserRound,
  Zap,
} from "lucide-react";

export interface ToolMeta {
  /** Route slug, e.g. "compress-image" */
  slug: string;
  /** Page headline exactly as in the source HTML */
  title: string;
  /** Short description used on cards */
  description: string;
  icon: LucideIcon;
  /** Grouping used on the landing page */
  group: "edit" | "convert" | "resize" | "social";
}

/**
 * All 21 tools exported from Stitch. The resize-image component is
 * mounted at two routes (/resize-image-pixel and /resize-image-in-cm);
 * the directory entry below points at the pixel variant, and the
 * landing page's "quick links" section links the cm variant too.
 */
export const TOOLS: ToolMeta[] = [
  // --- Core editing ---
  {
    slug: "compress-image",
    title: "Compress Image",
    description: "Reduce file size without losing quality.",
    icon: Minimize2,
    group: "edit",
  },
  {
    slug: "crop-image",
    title: "Crop Image",
    description: "Trim edges and focus on what matters.",
    icon: Crop,
    group: "edit",
  },
  {
    slug: "rotate-image",
    title: "Rotate Image",
    description: "Turn images clockwise or counter-clockwise.",
    icon: RotateCw,
    group: "edit",
  },
  {
    slug: "flip-image",
    title: "Flip Image",
    description: "Mirror images horizontally or vertically.",
    icon: FlipHorizontal,
    group: "edit",
  },
  {
    slug: "grayscale-image",
    title: "Grayscale Image",
    description: "Convert photos to striking black and white.",
    icon: Palette,
    group: "edit",
  },
  {
    slug: "add-text-to-image",
    title: "Add Text to Image",
    description: "Overlay custom typography and messaging.",
    icon: Type,
    group: "edit",
  },
  {
    slug: "add-logo-to-image",
    title: "Add Logo to Image",
    description: "Embed your brand mark with precision.",
    icon: Frame,
    group: "edit",
  },
  {
    slug: "watermark-image",
    title: "Add Watermark",
    description: "Protect images with text or logo overlays.",
    icon: Blend,
    group: "edit",
  },
  {
    slug: "ai-enhance-image",
    title: "AI Enhance",
    description: "Intelligent upscaling and clarity for photos.",
    icon: Sparkles,
    group: "edit",
  },
  // --- Format conversion ---
  {
    slug: "jpeg-to-jpg",
    title: "JPEG to JPG",
    description: "Standardize file extensions with zero quality loss.",
    icon: Repeat,
    group: "convert",
  },
  {
    slug: "png-to-jpeg",
    title: "PNG to JPEG",
    description: "Convert transparency to solid backgrounds.",
    icon: ImageDown,
    group: "convert",
  },
  {
    slug: "heic-to-jpg",
    title: "HEIC to JPG",
    description: "Make iPhone photos universal and easy to share.",
    icon: Camera,
    group: "convert",
  },
  {
    slug: "webp-to-jpg",
    title: "WebP to JPG",
    description: "Convert modern formats for wider compatibility.",
    icon: FileOutput,
    group: "convert",
  },
  {
    slug: "image-to-pdf",
    title: "Image to PDF",
    description: "Compile multiple images into a single document.",
    icon: FileText,
    group: "convert",
  },
  // --- Resizing ---
  {
    slug: "resize-image-pixel",
    title: "Resize Image",
    description: "Change image dimensions instantly in px or cm.",
    icon: Maximize,
    group: "resize",
  },
  {
    slug: "square-image-cropper",
    title: "Square Image Cropper",
    description: "Make images perfectly square for social media.",
    icon: Square,
    group: "resize",
  },
  {
    slug: "circle-crop",
    title: "Circle Crop",
    description: "Crop images into perfect circles.",
    icon: CircleDot,
    group: "resize",
  },
  // --- Social / document presets ---
  {
    slug: "resize-image-for-instagram",
    title: "Instagram Resize",
    description: "Optimize images for feed, stories, or profile pictures.",
    icon: Scan,
    group: "social",
  },
  {
    slug: "resize-image-for-whatsapp-dp",
    title: "WhatsApp DP Resize",
    description: "Size profile pictures without losing the subject.",
    icon: UserRound,
    group: "social",
  },
  {
    slug: "passport-size-photo",
    title: "Passport Size Photo",
    description: "Format photos for official documents.",
    icon: IdCard,
    group: "social",
  },
  {
    slug: "resize-for-pan-card",
    title: "PAN Card Resize",
    description: "Specific sizing for ID card applications.",
    icon: Zap,
    group: "social",
  },
];

export const TOOL_GROUPS: { id: ToolMeta["group"]; label: string }[] = [
  { id: "edit", label: "Edit & Enhance" },
  { id: "convert", label: "Convert Format" },
  { id: "resize", label: "Resize & Crop" },
  { id: "social", label: "Social & Document Presets" },
];

/** Look up a tool by its route slug. */
export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/** Metadata about how each tool page is laid out (per the Stitch exports). */
export interface PageMeta {
  /** Source HTML file (under reference/) */
  source: string;
  /** <title> from the source HTML */
  title: string;
  /** H1 headline rendered in the hero */
  headline: string;
  /** Hero sub-copy */
  description: string;
  /** Which layout family the source uses */
  family: "landing" | "workspace";
  /** A string guaranteed to appear in the rendered page (verification hook) */
  verifyString: string;
}

/** Per-page metadata keyed by route directory. */
export const PAGE_META: Record<string, PageMeta> = {
  "compress-image": {
    source: "compress_image_luminaedit_ai.html",
    title: "Compress Image",
    headline: "Compress Image",
    description:
      "Reduce file size without losing quality. Optimized for web and performance.",
    family: "landing",
    verifyString: "Drag & Drop Image Here",
  },
  "resize-image-pixel": {
    source: "resize_image_luminaedit_ai.html",
    title: "Resize Image",
    headline: "Resize Image",
    description:
      "Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms.",
    family: "landing",
    verifyString: "Maintain Aspect Ratio",
  },
  "resize-image-in-cm": {
    source: "resize_image_luminaedit_ai.html",
    title: "Resize Image in CM",
    headline: "Resize Image",
    description:
      "Change image dimensions instantly for any platform. Maintain pristine quality with advanced interpolation algorithms.",
    family: "landing",
    verifyString: "Maintain Aspect Ratio",
  },
  "crop-image": {
    source: "crop_image_luminaedit_ai.html",
    title: "Crop Image",
    headline: "Crop Image",
    description:
      "Trim edges and focus on what matters. Precision cropping tools for professional results.",
    family: "landing",
    verifyString: "Frequently Asked Questions",
  },
  "square-image-cropper": {
    source: "square_luminaedit_ai.html",
    title: "Square Image Cropper",
    headline: "Square Cropper",
    description: "Make images perfectly square for social media.",
    family: "workspace",
    verifyString: "Square Cropper",
  },
  "circle-crop": {
    source: "circle_luminaedit_ai.html",
    title: "Circle Crop",
    headline: "Circle Crop",
    description: "Crop images into perfect circles.",
    family: "workspace",
    verifyString: "Crop images into perfect circles.",
  },
  "rotate-image": {
    source: "rotate_luminaedit_ai.html",
    title: "Rotate Image",
    headline: "Rotate",
    description: "Turn images clockwise or counter-clockwise.",
    family: "workspace",
    verifyString: "Turn images clockwise or counter-clockwise.",
  },
  "flip-image": {
    source: "flip_luminaedit_ai.html",
    title: "Flip Image",
    headline: "Flip Image",
    description: "Mirror images horizontally or vertically.",
    family: "workspace",
    verifyString: "Mirror images horizontally or vertically.",
  },
  "watermark-image": {
    source: "add_watermark_luminaedit_ai.html",
    title: "Add Watermark",
    headline: "Add Watermark",
    description:
      "Protect your images with text or logo overlays. Customize opacity, position, and scale for perfect integration.",
    family: "landing",
    verifyString: "Watermark Settings",
  },
  "add-text-to-image": {
    source: "add_text_luminaedit_ai.html",
    title: "Add Text to Image",
    headline: "Text Properties",
    description: "Overlay custom typography and messaging.",
    family: "workspace",
    verifyString: "Overlay custom typography and messaging.",
  },
  "add-logo-to-image": {
    source: "add_logo_luminaedit_ai.html",
    title: "Add Logo to Image",
    headline: "Add Logo",
    description: "Embed your brand mark with precision.",
    family: "workspace",
    verifyString: "Embed your brand mark with precision.",
  },
  "jpeg-to-jpg": {
    source: "jpeg_to_jpg_luminaedit_ai.html",
    title: "JPEG to JPG Converter",
    headline: "JPEG to JPG Converter",
    description:
      "Standardize file extensions and maintain compatibility across all professional workflows with zero quality loss.",
    family: "workspace",
    verifyString: "Start Conversion",
  },
  "png-to-jpeg": {
    source: "png_to_jpeg_luminaedit_ai.html",
    title: "PNG to JPEG Converter",
    headline: "PNG to JPEG Converter",
    description:
      "Convert transparent images to solid backgrounds with precision control over compression artifacts.",
    family: "workspace",
    verifyString: "Conversion Settings",
  },
  "heic-to-jpg": {
    source: "heic_to_jpg_luminaedit_ai.html",
    title: "HEIC to JPG",
    headline: "HEIC to JPG",
    description: "Make iPhone photos universal and easy to share.",
    family: "workspace",
    verifyString: "Drag & Drop HEIC files",
  },
  "webp-to-jpg": {
    source: "webp_to_jpg_luminaedit_ai.html",
    title: "WebP to JPG",
    headline: "WebP to JPG",
    description: "Convert modern web formats for wider compatibility.",
    family: "workspace",
    verifyString: "Conversion Settings",
  },
  "image-to-pdf": {
    source: "image_to_pdf_luminaedit_ai.html",
    title: "Image to PDF",
    headline: "Image to PDF",
    description: "Compile multiple images into a single document.",
    family: "landing",
    verifyString: "Selected Files (3)",
  },
  "grayscale-image": {
    source: "grayscale_luminaedit_ai.html",
    title: "Grayscale Image",
    headline: "Grayscale Image",
    description: "Convert photos to striking black and white.",
    family: "workspace",
    verifyString: "Convert photos to striking black and white.",
  },
  "resize-image-for-instagram": {
    source: "instagram_resize_luminaedit_ai.html",
    title: "Instagram Resize",
    headline: "Instagram Resize",
    description: "Optimize images for feed, stories, or profile pictures.",
    family: "workspace",
    verifyString: "Format Preset",
  },
  "resize-image-for-whatsapp-dp": {
    source: " whatsapp_dp_luminaedit_ai.html",
    title: "WhatsApp DP Resize",
    headline: "WhatsApp DP Resize",
    description:
      "Perfectly size your profile picture without cropping out the important parts.",
    family: "workspace",
    verifyString: "Perfectly size your profile picture",
  },
  "passport-size-photo": {
    source: "passport_photo_luminaedit_ai.html",
    title: "Passport Size Photo",
    headline: "Passport Size Photo",
    description:
      "Format photos for official documents with standard dimensions and alignment guides.",
    family: "workspace",
    verifyString: "Country Presets",
  },
  "resize-for-pan-card": {
    source: "pan_card_resize_luminaedit_ai.html",
    title: "PAN Card Resize",
    headline: "PAN Card Resize",
    description:
      "Specific sizing for ID card applications. Standard dimensions (213x213px) with file size limits.",
    family: "workspace",
    verifyString: "Auto-Process Image",
  },
  "ai-enhance-image": {
    source: "ai_enhance_luminaedit_ai.html",
    title: "AI Enhance",
    headline: "AI Enhance",
    description:
      "Intelligent upscaling and clarity for low-res photos. Breathe new life into your images with a single click.",
    family: "landing",
    verifyString: "Enhancement Settings",
  },
};
