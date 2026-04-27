import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Libre_Baskerville } from "next/font/google";
import {Playfair_Display} from "next/font/google";
import { Analytics } from "@vercel/analytics/react"

// Prefer the canonical public URL; fall back to Vercel's preview URL, then localhost.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
});

// ...existing imports...

// Removed duplicate RootLayout function
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Worrry",
  description: "Worrry. Bad news, well paced.",
  openGraph: {
    title: "Worrry",
    description: "Bad news, well paced.",
    url: siteUrl,
    siteName: "Worrry",
    images: [
      {
        url: "/PTTP2.jpg",
        width: 1200,
        height: 630,
        alt: "Worrry",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Worrry",
    description: "Bad news, well paced.",
    images: ["/PTTP2.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  keywords: [
    "PERFECT TIME TO PANIC",
    "bad news",
    "doomscroll",
    "doomscrolling",
    "resistance",
    "authoritarianism",
    "news aggregator",
    "current events",
    "politics",
    "media",
    "crisis",
    "activism",
    "democracy",
    "social justice",
    "breaking news",
    "protest",
    "freedom",
    "dissent",
    "information",
    "news feed",
    "society",
    "civil rights",
    "press freedom",
    "misinformation",
    "disinformation",
    "censorship",
    "propaganda",
    "human rights",
    "government",
    "corruption",
    "oppression",
    "surveillance",
    "whistleblower",
    "transparency",
    "journalism",
    "independent media",
    "public opinion",
    "world news",
    "global issues",
    "conflict",
    "unrest",
    "emergency",
    "alert",
    "fact checking",
    "media literacy",
    "NEWS",
    // Media page specific
    "media coverage",
    "news analysis",
    "media bias",
    "media watchdog",
    "media criticism",
    "media landscape",
    "media outlets",
    "news sources",
    "media influence",
    "media trends",
    "media monitoring",
    "media reporting",
    "media ethics",
    "media transparency",
    "media accountability",
    "media consumption",
    "digital media",
    "online news",
    "alternative media",
    "mainstream media",
    "media platforms",
    "news curation",
    "news commentary",
    "media review",
    "media page",
    "media hub",
    "media roundup"
  ],
  // ...other meta fields
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
