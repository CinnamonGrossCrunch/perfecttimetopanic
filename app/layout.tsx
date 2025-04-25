import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "../components/AnimatedBackground";
import { Libre_Baskerville } from "next/font/google";
import {Playfair_Display} from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
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

export const metadata: Metadata = {
  title: "Perfect Time To Panic",
  description: "A Gross Domestic Production",
  openGraph: {
    title: "Perfect Time To Panic",
    description: "A Gross Domestic Production",
    url: "https://yourdomain.com",
    siteName: "Perfect Time To Panic",
    images: [
      {
        url: "/PTTP2.jpg",
        width: 1200,
        height: 630,
        alt: "Perfect Time To Panic",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Time To Panic",
    description: "A Gross Domestic Production",
    images: ["/PTTP2.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#ffffff",
  keywords: [
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
        <AnimatedBackground /> {/* <-- Add this line */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
