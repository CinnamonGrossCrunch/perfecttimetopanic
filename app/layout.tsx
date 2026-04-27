import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.worrry.com";

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
});

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
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Worrry",
  title: {
    default: "Worrry — Bad News: Good Timing.",
    template: "%s | Worrry",
  },
  description:
    "Worrry tracks the systemic threats to human rights, democracy, and global welfare. One curated briefing, refreshed every 2 hours. No doomscrolling. Reveal, Rethink, Respond.",
  keywords: [
    "Worrry",
    "systemic threats",
    "global threats news",
    "democracy erosion",
    "authoritarianism news",
    "climate crisis news",
    "AI risk",
    "artificial intelligence threats",
    "human rights news",
    "surveillance state",
    "disinformation news",
    "biosecurity",
    "pandemic risk",
    "nuclear threat",
    "war news",
    "economic collapse",
    "curated news briefing",
    "news aggregator",
    "doomscrolling alternative",
    "civic awareness",
    "existential risk",
    "independent journalism",
    "investigative journalism",
    "media literacy",
    "global news briefing",
    "world news",
    "geopolitics",
    "accountability journalism",
    "press freedom",
    "civil rights news",
    "fact-based reporting",
    "political news",
    "environmental news",
    "technology ethics",
    "misinformation",
    "information warfare",
    "human welfare",
    "social justice",
    "governance",
    "news curation",
    "threat intelligence",
  ],
  authors: [{ name: "Matt Gross", url: SITE_URL }],
  creator: "Matt Gross",
  publisher: "Worrry",
  category: "news",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Worrry — Bad News: Good Timing.",
    description:
      "Track the systemic threats to human rights, democracy, and global welfare. One curated briefing, refreshed every 2 hours. No doomscrolling.",
    url: SITE_URL,
    siteName: "Worrry",
    images: [
      {
        url: "/PTTP2.jpg",
        width: 1200,
        height: 630,
        alt: "Worrry — Bad News: Good Timing.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Worrry — Bad News: Good Timing.",
    description:
      "Track systemic threats to democracy, human rights & global welfare. One curated briefing, no doomscrolling.",
    images: ["/PTTP2.jpg"],
    site: "@worrry",
    creator: "@worrry",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Worrry",
      description:
        "Track the systemic threats to human rights, democracy, and global welfare. One curated briefing. No doomscrolling.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": ["Organization", "NewsMediaOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: "Worrry",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/PTTP2.jpg`,
        width: 1200,
        height: 630,
      },
      description:
        "Worrry tracks the systemic threats to human rights, democracy, and global welfare. One curated briefing. No doomscrolling.",
      founder: { "@type": "Person", name: "Matt Gross" },
      publishingPrinciples: `${SITE_URL}/about`,
      masthead: `${SITE_URL}/about`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${libre.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
