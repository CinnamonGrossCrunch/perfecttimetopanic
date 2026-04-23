"use client";

import { useEffect, useState } from "react";
import type { Editorial } from "../lib/worrryEditorial";
import { SiteHeader } from "./SiteHeader";
import { ArticleCard, type Article, type Summary } from "./ArticleCard";
import { ListCard } from "./ListCard";
import { TopicsNav } from "./TopicsNav";
import { EditorialCard } from "./EditorialCard";

type Props = {
  articles: Article[];
  summaries: Summary[];
  editorial: Editorial | null;
};

type Item = { article: Article; summary: Summary | undefined };

// Tier sizes. Adjust these to change how many articles appear in each band.
const FEATURED_COUNT = 6; // after the hero, in a 2-col grid
const MORE_COUNT = 15; // after featured, dense list with small thumbnails

function computeTopicCounts(articles: Article[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of articles) {
    for (const t of a.relevance?.topics ?? []) {
      out[t] = (out[t] ?? 0) + 1;
    }
  }
  return out;
}

/**
 * Simple section-header style — serif, bold, top rule. Shared across tiers.
 */
function TierHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-b border-white/10 pb-3 font-['Libre_Baskerville',serif] text-[22px] font-bold text-[#f9f3e6] md:text-2xl">
      {children}
    </h2>
  );
}

export default function ArticleGrid({ articles, summaries, editorial }: Props) {
  const [showPaywallOptions, setShowPaywallOptions] = useState(false);
  const [showMobileButtons, setShowMobileButtons] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [, setDragCounter] = useState(0);

  useEffect(() => {
    const handleDragEnd = () => {
      setDragCounter(0);
      setIsDraggingOver(false);
    };
    const handleDragLeaveWindow = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setDragCounter(0);
        setIsDraggingOver(false);
      }
    };
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);
    window.addEventListener("dragleave", handleDragLeaveWindow);
    return () => {
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
      window.removeEventListener("dragleave", handleDragLeaveWindow);
    };
  }, []);

  // Build items in the same order buildFeed delivered (already score-desc, then date-desc).
  const items: Item[] = articles.map((article, i) => ({
    article,
    summary: summaries[i],
  }));
  const hero = items[0];
  const featured = items.slice(1, 1 + FEATURED_COUNT);
  const more = items.slice(1 + FEATURED_COUNT, 1 + FEATURED_COUNT + MORE_COUNT);
  const topicCounts = computeTopicCounts(articles);

  const editorialImage =
    articles.find((a) => a.thumbnail || a.image)?.thumbnail ??
    articles.find((a) => a.thumbnail || a.image)?.image ??
    null;

  return (
    <div className="relative min-h-screen font-sans text-foreground">
      <SiteHeader variant="home" articleCount={articles.length} />

      <main className="relative mx-auto max-w-6xl px-6 pt-20 pb-32">
        {/* ===== HOMEPAGE HERO — center-aligned, enlarged ===== */}
        <div className="relative pb-6 pt-12 text-center md:pb-10 md:pt-20">
          <h1 className="font-['Fair_Play',serif] text-[76px] leading-[0.92] tracking-[-0.02em] text-[#FFF8E0] drop-shadow-[0_0_30px_rgba(255,248,224,0.12)] md:text-[128px] lg:text-[150px]">
            Worrry<span className="text-red-500">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base italic text-white/70 md:mt-6 md:text-lg">
            Bad News: Good timing.
          </p>
        </div>

        {/* ===== WORRRY EDITORIAL ===== */}
        {editorial && <EditorialCard editorial={editorial} imageUrl={editorialImage} />}

        {items.length === 0 ? (
          <p className="mt-16 text-center text-sm text-white/50">
            No articles to show right now. The feed will refresh shortly.
          </p>
        ) : (
          <>
            {/* ===== HERO TIER (top 1, marquee) ===== */}
            {hero && (
              <div className="mt-16">
                <ArticleCard article={hero.article} summary={hero.summary} variant="hero" />
              </div>
            )}

            {/* ===== FEATURED STORIES TIER (2-col landscape cards) ===== */}
            {featured.length > 0 && (
              <section className="mt-16">
                <TierHeader>Featured Stories</TierHeader>
                <div className="grid gap-8 md:grid-cols-2">
                  {featured.map(({ article, summary }, i) => (
                    <ArticleCard
                      key={i}
                      article={article}
                      summary={summary}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ===== MORE STORIES TIER (dense list, small thumbnails) ===== */}
            {more.length > 0 && (
              <section className="mt-16">
                <TierHeader>More Stories</TierHeader>
                <div className="flex flex-col">
                  {more.map(({ article, summary }, i) => (
                    <ListCard key={i} article={article} summary={summary} />
                  ))}
                </div>
              </section>
            )}

            {/* ===== BROWSE BY THREAT ===== */}
            <TopicsNav counts={topicCounts} />
          </>
        )}
      </main>

      <footer className="pb-12 text-center text-xs text-stone/70">
        <p>Awareness is power. A Gross Domestic Production.</p>
      </footer>

      {/* ===== FAB ===== */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-300/80 text-white shadow-lg transition hover:bg-yellow-400 hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2"
        aria-label="Show quick actions"
        onClick={() => {
          setShowMobileButtons((v) => {
            if (v) setShowPaywallOptions(false);
            return !v;
          });
        }}
      >
        <img
          src="/plus-icon.svg"
          alt="Toggle menu"
          className="h-8 w-8 transition-transform duration-500"
          style={{
            filter: showMobileButtons ? "invert(0)" : "invert(1)",
            transform: showMobileButtons ? "rotate(45deg) scale(1.8)" : "rotate(0deg) scale(2.0)",
          }}
        />
      </button>

      {/* ===== FLOATING BUTTONS ===== */}
      <div
        className={`fixed bottom-28 right-[-0.5rem] z-50 flex scale-120 flex-col items-end gap-4 transition-transform duration-700 ease-out ${
          showMobileButtons
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ willChange: "transform, opacity", fontSize: "1.5em", padding: "1em" }}
      >
        <div className="relative flex flex-col items-end gap-4" style={{ zIndex: 9999 }}>
          <button
            type="button"
            onClick={() => setShowPaywallOptions((v) => !v)}
            className="flex w-[320px] items-center justify-center rounded-l-full bg-yellow-300/80 px-6 py-1 font-['Fair_Play',serif] text-[#FFF8E0] shadow-glow shadow-md backdrop-blur-[12px] transition-all hover:bg-white/90 hover:text-black hover:shadow-3xl hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100"
            style={{ minWidth: "260px", maxWidth: "320px" }}
            aria-expanded={showPaywallOptions ? "true" : "false"}
          >
            Hitting a Paywall?
          </button>

          {showPaywallOptions && (
            <div
              className="absolute right-0 bottom-full mb-2 backdrop-blur-[12px]"
              style={{
                minWidth: "260px",
                maxWidth: "320px",
                borderRadius: "3rem",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                width: "320px",
                transform: "translateX(3%)",
              }}
            >
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragCounter((c) => {
                    const next = c + 1;
                    if (next === 1) setIsDraggingOver(true);
                    return next;
                  });
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => {
                  setDragCounter((c) => {
                    const next = Math.max(0, c - 1);
                    if (next === 0) setIsDraggingOver(false);
                    return next;
                  });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragCounter(0);
                  setIsDraggingOver(false);
                  const url = e.dataTransfer.getData("text/plain");
                  if (url) {
                    const encoded = encodeURIComponent(url);
                    window.open(`https://www.removepaywall.com/search?url=${encoded}`, "_blank");
                  }
                }}
                className={`flex w-full flex-col items-stretch justify-between gap-6 p-4 text-md shadow-glow backdrop-blur-lg hover:shadow-3xl ${
                  isDraggingOver ? "bg-white/20 text-white" : "border-2 border-dashed border-yellow-200 bg-white/10 text-white"
                } transition-all duration-300 ease-in-out`}
                style={{
                  transform: "translateX(-8%)",
                  cursor: "help",
                  borderRadius: "2.8rem",
                  boxShadow: isDraggingOver
                    ? "0 0 100px rgb(255, 254, 169)"
                    : "0 0 40px rgba(253, 224, 71, 0.3)",
                  background: isDraggingOver ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
                  border: isDraggingOver ? "none" : "3px dashed rgba(253, 224, 71, 0.9)",
                  outline: isDraggingOver ? "3px solid rgba(255, 255, 255, 0.9)" : "none",
                  scale: isDraggingOver ? "1.05" : "1",
                  zIndex: 9999,
                  position: "relative",
                  textShadow: "0 0 12px #fff, 0 0 24px rgb(0, 0, 0)",
                }}
              >
                <div
                  className="hidden w-full items-center justify-center text-center font-medium leading-snug text-inherit sm:flex"
                  style={{ fontSize: "0.7em", minHeight: "180px" }}
                >
                  + Drag an article here <br /> to remove paywall.
                </div>

                <div className="flex flex-row justify-center gap-5">
                  {[
                    {
                      href: "https://www.icloud.com/shortcuts/373258eb20f64415a2d588075b13755f",
                      img: "/Apple-Logosu.png",
                      scale: 1.5,
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
                      className="flex items-center justify-center rounded-full bg-yellow-300/50 p-2 text-black shadow-glow backdrop-blur-[12px] transition hover:bg-white/90 hover:shadow-2xl hover:shadow-3xl hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100"
                      style={{ width: "4rem", height: "4rem" }}
                    >
                      <img
                        src={img}
                        alt={alt}
                        className="object-contain"
                        style={{ width: "2rem", height: "2rem", transform: `scale(${scale})` }}
                      />
                    </a>
                  ))}
                </div>

                {isDraggingOver && (
                  <span
                    className="rainbow-border-animate pointer-events-none absolute inset-0"
                    style={{ zIndex: 10, boxSizing: "content-box" }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          )}

          <a
            href="https://mattdpearce.substack.com/p/best-ways-to-support-journalism-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[320px] items-center justify-center rounded-l-full bg-yellow-300/80 px-6 py-1 font-['Fair_Play',serif] text-[#FFF8E0] shadow-glow shadow-md backdrop-blur-[12px] transition-all hover:bg-white/90 hover:text-black hover:shadow-3xl hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          >
            Support Journalism
          </a>

          <a
            href="https://wellbeingtrust.org/resources/mental-health-resources/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[320px] items-center justify-center rounded-l-full bg-yellow-300/80 px-6 py-1 font-['Fair_Play',serif] text-[#FFF8E0] shadow-glow shadow-md backdrop-blur-[12px] transition-all hover:bg-white/90 hover:text-black hover:shadow-3xl hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          >
            Mental Wellness
          </a>

          <button
            type="button"
            onClick={() => location.reload()}
            className="flex w-[320px] items-center justify-center rounded-l-full bg-yellow-300/80 px-6 py-1 font-['Fair_Play',serif] text-[#FFF8E0] shadow-glow shadow-md backdrop-blur-[12px] transition-all hover:bg-white/90 hover:text-black hover:shadow-3xl hover:shadow-[0_0_32px_8px_rgba(253,224,71,0.5)] hover:ring-4 hover:ring-yellow-300 hover:ring-offset-2 hover:ring-offset-yellow-100"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          >
            Refresh Feed
          </button>
        </div>
      </div>
    </div>
  );
}
