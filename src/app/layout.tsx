import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  variable: "--font-speckle-display",
  style: ["normal", "italic"],
  axes: ["opsz"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-speckle-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Speckle · Earth is always changing",
  description:
    "A cinematic journey from orbit into Earth's changing landscapes. Built for NASA Space Apps Challenge 2026, Dancing with the SARs.",
  keywords: [
    "Speckle",
    "Earth observation",
    "SAR",
    "radar",
    "NASA Space Apps",
    "Dancing with the SARs",
    "hazard engine",
  ],
  authors: [{ name: "Dancing with the SARs team" }],
  openGraph: {
    title: "Speckle · Earth is always changing",
    description:
      "A cinematic journey from orbit into Earth's changing landscapes, observed from space and measured in radar.",
    siteName: "Speckle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Speckle · Earth is always changing",
    description:
      "A cinematic journey from orbit into Earth's changing landscapes.",
  },
};

export const viewport: Viewport = {
  themeColor: "#04070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} antialiased bg-[#04070d] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
