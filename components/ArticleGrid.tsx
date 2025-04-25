"use client";
import { useState } from "react";

type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  thumbnail?: string | null;
  image?: string | null; // fallback if thumbnail is missing
  source: {
    name: string;
  };
};

type Props = {
  articles: Article[];
  summaries: string[];
};

export default function ArticleGrid({ articles, summaries }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMore = () => setVisibleCount((c) => c + 6);
  const [showPaywallOptions, setShowPaywallOptions] = useState(false);

  return (
    <div className="relative min-h-screen font-sans text-foreground overflow-hidden">

      {/* 🔲 Background */}
      <div className="absolute inset-0 bg-black" style={{ zIndex: -2 }} />

      {/* 🔥 Header Background Image */}
      <div className="absolute inset-0 overflow-hidden -z-1">
        <img
          src="/PTTP2.jpg"
          alt="Perfect Time to Panic"
          className="w-full h-300 object-cover object-left-top opacity-70 mix-multiply blur-[.5px]"
          style={{
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            maskSize: "100% 100%",
          }}
        />
      </div>

      {/* 🧠 Header Text */}
      <div className="relative z-20">
        <header className="relative max-w-8xl mx-auto text-center pt-20 px-6">
          <h1
            className="text-9xl font-['Fair_Play',serif] text-[#FFF8E0] drop-shadow-xl glow-3xl yellow-300"
            style={{ letterSpacing: "0.0em" }}
          >
            Perfect Time 
            <br />to Panic.
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto mt-4">
            Your curated dashboard of humanity's existential threats —
            <br />Not to spiral, but to stay sharp.
            <br />Not to fear, but to focus.
          </p>
        </header>

        {/* 📚 Article Cards */}
        <main className="relative mt-20 columns-2 space-y-4 max-w-4xl mx-auto px-6">
          {articles.slice(0, visibleCount).map((article, idx) => {
            const displaySource = article.source?.name ?? "Unknown Source";
            const imgSrc = article.thumbnail || article.image || null;

            return (
                <a
                  // Use the article index as the React key (ideally use a unique id if available)
                  key={idx}
                  // The URL to open when the card is clicked
                  href={article.url}
                  // Open the link in a new browser tab
                  target="_blank"
                  // Security best practice: prevent the new page from accessing window.opener
                  rel="noopener"
                  // Tailwind CSS classes for styling the card:
                  // - flex layout, vertical direction
                  // - space between content and footer
                  // - minimum height, padding, rounded corners, background blur
                  // - shadow, text color, hover effects
                  className="
                    flex flex-col justify-between min-h-[350px] p-6
                    rounded-3xl bg-white/40 backdrop-blur-sm shadow-glow
                    text-[#23272f] transition hover:shadow-3xl
                    hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2
                    hover:ring-offset-yellow-100 hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]
                    hover:bg-white/90
                  "
                >
                  <h3
  className="text-accent font-serif text-3xl mb-2 line-clamp-2"
  style={{
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {article.title}
</h3>
                  {imgSrc && (
                    <img
                      // The article image (if available)
                      src={imgSrc}
                      alt=""
                      // Tailwind classes for image styling
                      className="w-full h-50 object-cover rounded-3xl mb-4"
                    />
                  )}
                  <p className="text-md font-serif text-[#000000] flex-1">
                    {/* Show summary if available, otherwise fallback to description */}
                    {summaries[idx] || article.description}
                  </p>
                    <p className="text-xs mt-4 text-right text-stone-500 flex items-center justify-end gap-2">
                   
                    {new Date(article.publishedAt).toLocaleDateString()} &middot;{" "}
                    {displaySource}
                     {/* Try to show the source logo if possible */}
                     {article.url && (
                      <img
                      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                        new URL(article.url).hostname
                      )}&sz=32`}
                      alt={`${displaySource} logo`}
                      className="inline-block w-8 h-8 mr-1 align-middle rounded"
                      style={{ background: "#fff" }}
                      />
                    )}
                    </p>
                </a>
            );
          })}
        </main>

        {/* 🔘 Load More */}
        {visibleCount < articles.length && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-accent text-white rounded-lg shadow hover:bg-red-500 transition"
            >
              See More
            </button>
          </div>
        )}

        {/* 🧾 Footer */}
        <footer className="text-center text-sm text-stone mt-32 pb-12 px-6">
          <p>Awareness is power.</p>
        </footer>
        {/* 🧭 Floating Tab Buttons */}
<div className="fixed right-0 top-3/4 z-50 flex flex-col gap-3 pr-0">
  <button
    onClick={() => setShowPaywallOptions((v) => !v)}
    className="bg-yellow-300/30 backdrop-blur-sm shadow-glow
      text-[#FFFFFF] transition hover:shadow-3xl px-4 py-2 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2
      hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]
      hover:bg-white/90 transition-all flex justify-center items-center"
    style={{ right: "15px", minWidth: "140px" }}
    aria-expanded={showPaywallOptions}
  >
    Hitting a Paywall?
  </button>
  <div
    className={`
      absolute right-full bottom-1 flex flex-row gap-5 bg-white/0 rounded-3xl shadow px-5 py-4 z-50 items-center
      transition-transform duration-700 ease-out
      ${showPaywallOptions ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"}
    `}
    style={{ minWidth: "220px", top: "0%", transform: "translateY(-40%)" }}
  >
    {[
      {
        href: "https://www.icloud.com/shortcuts/373258eb20f64415a2d588075b13755f",
        img: "/Apple-Logosu.png",
        alt: "Apple Shortcut",
        label: "Apple Shortcut",
      },
      {
        href: "https://chromewebstore.google.com/detail/open-site-in-removepaywal/nfnpoaaallnibpcejlobbajnohipmhnd",
        img: "/Google_Chrome_icon_(February_2022).svg.png",
        alt: "Google Chrome",
        label: "Chrome Extension",
      },
      {
        href: "https://www.removepaywall.com/",
        img: "/REMOVE PAYWALL.svg",
        alt: "Remove Paywall",
        label: "Remove Paywall",
      },
    ].map(({ href, img, alt, label }) => (
      <div key={href} className="relative group flex items-center justify-center">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-300/50 backdrop-blur-sm shadow-glow text-white px-3 py-1 rounded-full shadow transition text-sm flex items-center justify-center hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2
            hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]
            hover:bg-white/90 transition-all"
          style={{ maxWidth: "6.5em", minWidth: "6.5em", aspectRatio: "1 / 1" }}
        >
          <img
            src={img}
            alt={alt}
            className="w-10 h-10 object-cover mx-auto"
            style={{ borderRadius: "50%" }}
          />
        </a>
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50"
          style={{ minWidth: "180px" }}
        >
          {href}
        </span>
      </div>
    ))}
  </div>
    
  <a
    href="https://wellbeingtrust.org/resources/mental-health-resources/"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-yellow-300/30 backdrop-blur-sm shadow-glow
                    text-[#FFFFFF] transition hover:shadow-3xl px-4 py-2 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2
                    hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]
                    hover:bg-white/90 transition-all "
                    style={{ alignContent: "15px" }}
  >
    Mental Wellness
  </a>
  <button
    onClick={() => location.reload()}
    className="bg-yellow-300/30 backdrop-blur-sm shadow-glow
                    text-[#FFFFFF] transition hover:shadow-3xl px-4 py-2 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2
                    hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]
                    hover:bg-white/90 transition-all "
                    style={{ right: "15px" }}
  >
    Refresh Feed
  </button>
</div>

      </div>
    </div>
  );
}
