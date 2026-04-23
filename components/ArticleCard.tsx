"use client";

import { useState } from "react";
import { sectionByTopic } from "../lib/sections";
import { parseAction, relativeTime } from "../lib/cardHelpers";
import { ImageFallback } from "./ImageFallback";

export type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  thumbnail?: string | null;
  image?: string | null;
  source: { name: string };
  relevance?: { score: number; topics: string[]; geographies: string[] };
};

export type Summary = {
  "the panic": string;
  "the hope": string;
  "the action": string;
};

type Variant = "hero" | "compact";

export function ArticleCard({
  article,
  summary,
  variant,
}: {
  article: Article;
  summary: Summary | undefined;
  variant: Variant;
}) {
  const isHero = variant === "hero";
  const imgSrc = article.thumbnail || article.image || null;
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !imgSrc || imgFailed;
  const sourceName = article.source?.name ?? "Unknown";
  const time = relativeTime(article.publishedAt);

  // Show the primary topic tag (first in the array). Additional topics are available
  // on article.relevance.topics but intentionally not rendered on the card to avoid clutter.
  const primaryTopic = article.relevance?.topics?.[0];
  const section = sectionByTopic(primaryTopic);
  const topicLabel = section?.shortTag ?? null;

  const metaBits = [topicLabel, sourceName.toUpperCase(), time].filter(Boolean);
  const action = summary?.["the action"]?.trim() ? parseAction(summary["the action"]) : null;

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", article.url);
        e.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("dragging");
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        window.open(article.url, "_blank");
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-[#15100e]/75 backdrop-blur-md ring-1 ring-white/5 transition-all duration-200 hover:ring-white/20 hover:bg-[#1a1412]/80 ${
        isHero
          ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
          : "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-black/30 ${
          isHero ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[4/3] md:aspect-auto md:h-full"
        }`}
      >
        {showFallback ? (
          <ImageFallback />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc!}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        )}
      </div>

      <div className={`flex flex-col gap-3 ${isHero ? "p-6 md:p-8" : "p-5 md:p-6"}`}>
        {metaBits.length > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-medium tracking-[0.18em] text-white/50">
            {metaBits.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-white/25">·</span>}
                <span className={i === 0 && topicLabel ? "text-red-300/90" : ""}>{b}</span>
              </span>
            ))}
          </p>
        )}

        <h3
          className={`font-['Libre_Baskerville',serif] font-bold leading-[1.2] text-[#f9f3e6] ${
            isHero ? "text-2xl md:text-[26px]" : "text-[19px] md:text-[20px]"
          }`}
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="outline-none hover:text-white focus-visible:underline focus-visible:decoration-red-400"
          >
            {article.title}
          </a>
        </h3>

        {summary && (
          <div className="mt-1 flex flex-col gap-3 text-[14.5px] leading-relaxed">
            {(summary["the panic"] || article.description) && (
              <p className="border-l-[3px] border-red-500/80 pl-3 text-white/90">
                {summary["the panic"]?.trim() ? summary["the panic"] : article.description}
              </p>
            )}
            {summary["the hope"]?.trim() && (
              <p className="pl-3 italic text-white/55">{summary["the hope"]}</p>
            )}
          </div>
        )}

        {action && action.href && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-red-600/90 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-500"
          >
            {action.text}
            <span aria-hidden="true">→</span>
          </a>
        )}
        {action && !action.href && (
          <p className="mt-1 text-[14px] italic text-white/70">{action.text}</p>
        )}
      </div>
    </article>
  );
}
