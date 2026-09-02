import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Geist is the font family every Stitch export references
 * (previously via Google Fonts CDN). We self-host it with
 * next/font/local so no external CDN requests are made.
 */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://picfix.duckdns.org"),
  title: {
    default: "Picfix Image Tool — Compress, Resize & Edit Images",
    template: "%s | Picfix Image Tool",
  },
  description:
    "Picfix Image Tool is a collection of free online tools like Image Compressor, Image resize tool, and Image conversion tools (Image to JPG, Image to PNG, etc).",
  themeColor: "#4449A6",
  applicationName: "Picfix Image Tool",
  keywords: [
    "image editor",
    "compress image",
    "reduce image size in kb",
    "resize image pixel",
    "passport size photo",
    "crop image",
    "heic to jpg",
    "webp to jpg",
    "image to pdf",
  ],
  authors: [{ name: "Picfix Team" }],
  openGraph: {
    title: "Picfix Image Tool — Compress, Resize & Edit Images",
    description:
      "Compress, resize, crop, convert and edit images with Picfix Image Tool — free, private and fast.",
    url: "https://picfix.duckdns.org",
    siteName: "Picfix Image Tool",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-[#2b2f52] font-body-md antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
