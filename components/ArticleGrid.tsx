"use client";
import { transform } from "next/dist/build/swc/generated-native";
import { useState, useCallback } from "react";

type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  thumbnail?: string | null;
  image?: string | null;
  source: {
    name: string;
  };
};

type Summary = {
  "the panic": string;
  "the hope": string;
  "the action": string;
};

type Props = {
  articles: Article[];
  summaries: Summary[];
};

function getPaywallOptionsClassName(show: boolean): string {
  return `
    absolute right-full bottom-30 flex bg-white/0 rounded-3xl px-5 py-4 z-50 items-center
    transition-transform duration-700 ease-out
    ${show ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"}
    ${show ? "flex-col gap-3" : "flex-row gap-5"}
  `;
}

export default function ArticleGrid({ articles, summaries }: Props) {
  // --- State & Handlers ---
  const [visibleCount, setVisibleCount] = useState(6);
  const [showPaywallOptions, setShowPaywallOptions] = useState(false);
  const [showMobileButtons, setShowMobileButtons] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const loadMore = () => setVisibleCount((c) => c + 6);

  const toggleMobileButtons = useCallback(() => {
    setShowMobileButtons((v) => !v);
  }, []);

  // --- Render ---
  return (
    <div className="relative min-h-screen font-sans text-foreground overflow-hidden">
      {/* ===== HEADER ===== */}
      <div className="fixed top-0 left-0 w-full h-16 bg-white/00 shadow- z-1000 flex items-center justify-between px-6" style={{ backdropFilter: "blur(2px)" }}>
        <img src="/woody hat 256x256.png" alt="Woody Hat" className="w-10 h-10 object-cover" style={{ borderRadius: "50%", transform: "translatex(-40%)" }} />
      </div>

      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0 bg-black" style={{ zIndex: -2 }} />
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

      {/* ===== TITLE AREA ===== */}
      <div className="relative z-20">
  <header className="relative max-w-8xl mx-auto text-center pt-20 px-6">
    <h1 className="text-6xl sm:text-6xl md:text-8xl lg:text-9xl font-['Fair_Play',serif] text-[#FFF8E0] drop-shadow-xl glow-3xl yellow-300" style={{ letterSpacing: "0.0em", wordBreak: "break-word" }}>
      Perfect Time <br /> to Panic.
    </h1>
    <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto mt-4">
      Your curated dashboard of society's threats —<br />Not to spiral, but to stay sharp.<br />Not to fear, but to focus.
    </p>
  </header> {/* ✅ this was missing in your earlier version */}
</div> {/* ✅ this closes the outer container properly */}


      {/* ===== ARTICLE GRID ===== */}
      <main className="relative mt-20 grid gap-4 max-w-4xl mx-auto px-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2xl grid-rows-3">
          {articles.slice(0, visibleCount).map((article, idx) => {
            const displaySource = article.source?.name ?? "Unknown Source";
            const imgSrc = article.thumbnail || article.image || null;
            const summary = summaries[idx];

            return (
              <div
                key={idx}
                onClick={() => window.open(article.url, "_blank")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.open(article.url, "_blank");
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", article.url);
                  e.currentTarget.classList.add("dragging");
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove("dragging");
                }}
                className="cursor-pointer flex flex-col justify-between min-h-[350px] p-6 rounded-3xl bg-white/80 backdrop-blur-sm shadow-glow text-[#23272f] transition hover:shadow-3xl hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/100"
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

                {imgSrc && <img src={imgSrc} alt="" className="w-full h-50 object-cover rounded-3xl mb-4" />}

                <div className="text-md font-serif text-[#000000] flex-1 flex flex-col gap-2">
                  <p>
                    <span className="font-bold">The Panic:</span>{" "}
                    {typeof summary?.["the panic"] === "string" && summary["the panic"].trim() !== ""
                      ? summary["the panic"]
                      : article.description}
                  </p>
                  {typeof summary?.["the hope"] === "string" && summary["the hope"].trim() !== "" && (
                    <p>
                      <span className="font-bold">The Hope:</span> {summary["the hope"]}
                    </p>
                  )}
                  {typeof summary?.["the action"] === "string" && summary["the action"].trim() !== "" && (
                    <>
                      <p className="font-bold">The Action:</p>
                      <div
                        className="text-sm underline text-blue-700 hover:text-blue-900"
                        dangerouslySetInnerHTML={{ __html: summary["the action"] }}
                      />
                    </>
                  )}
                </div>

                <p className="text-xs mt-4 text-right text-stone-500 flex items-center justify-end gap-2">
                  {new Date(article.publishedAt).toLocaleDateString()} &middot; {displaySource}
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
              </div>
            );
          })}
        </main>

        {/* ===== SEE MORE BUTTON ===== */}
        {visibleCount < articles.length && (
          <div className="text-center mt-10">
            <div className="flex justify-center items-center w-full">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-yellow-300/80 text-white rounded-full shadow-lg border-2 border-yellow-400 transition  hover:shadow-3xl hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2  hover:text-black hover:bg-white/90 flex justify-center items-center w-64 h-16 text-lg font-semibold hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]"
              >
                See More
              </button>
            </div>
          </div>
        )}




 {/* 📎 Floating Buttons + Footer now correctly inside .z-20 */}
<footer className="text-center text-sm text-stone mt-32 pb-12 px-6">
  <p>Awareness is Power.  |  A Gross Domestic Production.</p>
</footer>

{/* FAB to toggle menu */}
<button
  className="text-xs transition hover:shadow-3xl hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2  hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/70 fixed z-50 bottom-6 right-6 bg-yellow-300/80 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-yellow-400 transition hover:bg-yellow-400"
  aria-label="Show quick actions"
  onClick={() => setShowMobileButtons((v) => !v)}
>
<img
  src="/plus-icon.svg"
  alt="Toggle menu"
  className="transition-transform duration-500 w-8 h-8 "
  style={{
    filter: showMobileButtons ? "invert(0)" : "invert(1)",
    transform: showMobileButtons ? "rotate(45deg) scale(1.8)" : "rotate(0deg) scale(2.0)",
  }}
/>
</button>

{/* Floating Buttons (slide in from right) */}
<div
  className={` 
    fixed z-50 bottom-28 right-[-0.5rem] flex flex-col gap-4 items-end scale-120
    transition-transform duration-700 ease-out
    ${showMobileButtons ? " translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"}
  `}
  style={{ willChange: "transform, opacity", fontSize: "1.5em", padding: " 1em" }}
>
  <div
  className="relative flex flex-col gap-4 items-end"
  style={{ zIndex: 50 }}
>
  {/* Paywall Toggle */}
  <button
    onClick={() => setShowPaywallOptions((v) => !v)}
    className="bg-yellow-300/80 backdrop-blur-sm shadow-glow font-['Fair_Play',serif] text-[#FFF8E0] transition hover:shadow-3xl px-6 py-1 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/90 transition-all flex justify-center items-center w-[320px]"
    style={{ minWidth: "260px", maxWidth: "320px" }}
    aria-expanded={showPaywallOptions}
    id="paywall-toggle-btn"
  >
    Hitting a Paywall?
  </button>

  {/* Paywall Options Menu */}
  {showPaywallOptions && (
    <div
      className="absolute right-0 bottom-full mb-2" // anchors menu above the button
      style={{
        minWidth: "260px",
        maxWidth: "320px",
        borderRadius: "3rem",
        backgroundColor: "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(0px)",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0)",
        border: "1px solid rgba(255, 255, 255, 0)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        width: "320px",
        transform: "translateX(5%)",
        justifyItems: "center",
      }}
      id="paywall-options-menu"
    >
      {/* Drop Zone */}
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const url = e.dataTransfer.getData("text/plain");
        if (url) {
          const encodedUrl = encodeURIComponent(url);
          window.open(`https://www.removepaywall.com/search?url=${encodedUrl}`, "_blank");
          }}}
          className={` w-full rounded-3xl p-4 flex flex-col items-bottom justify-between gap-6 
          ${isDraggingOver 
            ? "bg-white/90 ring-4 ring-yellow-300 ring-offset-2 ring-offset-yellow-100 border-4 border-yellow-300 text-black shadow-[0_0_32px_8px_rgba(253,224,71,0.5)]"
            : "bg-yellow-100/20 border-2 border-dashed text-white/70 border-yellow-200"}`}
          style={{
            transform: "translatex(-8%)",
          
          cursor: "help",
          backdropFilter: "blur(4px)",
          boxShadow: isDraggingOver ? "0 0 32px 8px rgba(253,224,71,0.7)" : undefined,
          transition: "box-shadow 0.3s, background 0.3s",
          }}
        >
      {/* Message */}
      <div
        className="hidden sm:flex text-inherit text-center text-lg font-medium leading-snug flex items-center justify-center w-full h-full"
        style={{ fontSize: "0.7em", minHeight: "180px" }}
        
      >
        + Drag an article here <br /> to remove paywall.
      </div>

      {/* Icon Buttons Row */}
      <div className="flex flex-row justify-center gap-5 align-items-bottom bottom-0">
        {[
          {
            href: "https://www.icloud.com/shortcuts/373258eb20f64415a2d588075b13755f",
            img: "/Apple-Logosu.png",
            scale: 1.5
            ,
            alt: "Apple Shortcut",
          },
          {
            href: "https://www.removepaywall.com/",
            img: "/REMOVE PAYWALL.svg",
            scale: 1.5,
            
            alt: "Remove Paywall",
          },
          {
            href: "https://chromewebstore.google.com/detail/open-site-in-removepaywal/nfnpoaaallnibpcejlobbajnohipmhnd",
            img: "/Google_Chrome_icon_(February_2022).svg.png",
            scale: 1,
            alt: "Google Chrome",
          },
        
        ].map(({ href, img, alt, scale }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-300/50 backdrop-blur-sm shadow-glow hover:shadow-2xl text-white rounded-full p-2 hover:scale-105 transition hover:shadow-3xl rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/90 "
            style={{ width: "4rem", height: "4rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              src={img}
              alt={alt}
              className="object-contain"
              style={{
                width: "2rem",
                height: "2rem",
                transform: `scale(${scale})`,
              }}
            />
          </a>
        ))}
      </div>
    </div>
    </div>
  )}
</div>


{/* Donate to Journalism */}
<a
    href="https://mattdpearce.substack.com/p/best-ways-to-support-journalism-in"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-yellow-300/80 backdrop-blur-sm shadow-glow font-['Fair_Play',serif] text-[#FFF8E0] transition hover:shadow-3xl px-6 py-1 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/90 transition-all flex justify-center items-center w-[320px]"

    style={{ minWidth: "260px", maxWidth: "320px" }}
  >
    Support Journalism
  </a>
    {/* Mental Wellness Link */}
    <a
    href="https://wellbeingtrust.org/resources/mental-health-resources/"
    target="_blank"
    rel="noopener noreferrer"
     className="bg-yellow-300/80 backdrop-blur-sm shadow-glow font-['Fair_Play',serif] text-[#FFF8E0] transition hover:shadow-3xl px-6 py-1 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/90 transition-all flex justify-center items-center w-[320px]"
    style={{ minWidth: "260px", maxWidth: "320px" }}
  >
    Mental Wellness
  </a>
  {/* Refresh Feed Button */}
  <button
    onClick={() => location.reload()}
     className="bg-yellow-300/80 backdrop-blur-sm shadow-glow font-['Fair_Play',serif] text-[#FFF8E0] transition hover:shadow-3xl px-6 py-1 rounded-l-full shadow-md hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100 hover:text-black hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:bg-white/90 transition-all flex justify-center items-center w-[320px]"
    style={{ minWidth: "260px", maxWidth: "320px" }}
  >
    Refresh Feed
  </button>
</div>
    </div>


  );  
}