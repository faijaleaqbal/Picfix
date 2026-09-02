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
    default: "Picfix — Free Online Image Editing Tools",
    template: "%s | Picfix",
  },
  description:
    "Professional grade image processing tools for modern workflows. Compress, resize, crop, convert, and enhance images with Picfix AI — free, private, and fast.",
  applicationName: "Picfix",
  keywords: [
    "image editor",
    "compress image",
    "resize image",
    "crop image",
    "heic to jpg",
    "webp to jpg",
    "image to pdf",
    "passport photo",
    "picfix ai",
  ],
  authors: [{ name: "Picfix Team" }],
  openGraph: {
    title: "Picfix — Free Online Image Editing Tools",
    description:
      "Professional grade image processing tools for modern workflows. Compress, resize, crop, convert, and enhance images with Picfix AI.",
    url: "https://picfix.duckdns.org",
    siteName: "Picfix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Picfix — Free Online Image Editing Tools",
    description: "Professional grade image processing tools for modern workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-body-md antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
