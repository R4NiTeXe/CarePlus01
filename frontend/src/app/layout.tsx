import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Public site URL — set NEXT_PUBLIC_SITE_URL when deploying so canonical
// links, sitemap, and share cards point at the real domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CarePlus Hospital — Multi-Speciality Care with Token-Based OPD",
    template: "%s | CarePlus Hospital",
  },
  description:
    "CarePlus Multi-Speciality Hospital: token-based OPD with zero-hour waits, in-house diagnostics, pharmacy, 24×7 emergency and ICU. Find departments, specialists, and visiting hours.",
  keywords: [
    "hospital",
    "multi-speciality hospital",
    "OPD appointment",
    "emergency care",
    "diagnostics lab",
    "pharmacy",
    "pediatrics",
    "cardiology",
  ],
  authors: [{ name: "CarePlus Hospital" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "CarePlus Hospital — Token-Based OPD. Zero-Hour Waits.",
    description:
      "Multiple specialities, in-house diagnostics and pharmacy, 24×7 emergency. Take a token and see your specialist on time.",
    url: "/",
    siteName: "CarePlus Hospital",
    type: "website",
    images: [{ url: "/images/hero-care-team.jpg", width: 1200, height: 630, alt: "CarePlus doctors and nurses with a patient" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarePlus Hospital — Token-Based OPD. Zero-Hour Waits.",
    description: "Multi-speciality care, in-house diagnostics, 24×7 emergency and ICU.",
    images: ["/images/hero-care-team.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#103B36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn(inter.variable, "min-h-screen bg-canvas antialiased")} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}