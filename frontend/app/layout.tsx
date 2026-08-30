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
  title: {
    default: "LuminaEdit AI — Free Online Image Editing Tools",
    template: "%s | LuminaEdit AI",
  },
  description:
    "Professional grade image processing tools for modern workflows. Compress, resize, crop, convert and enhance images — free, private and fast.",
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
