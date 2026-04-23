"use client";

import { useState } from "react";
import { sectionByTopic } from "../lib/sections";
import { relativeTime } from "../lib/cardHelpers";
import { ImageFallback } from "./ImageFallback";
import type { Article, Summary } from "./ArticleCard";

export function ListCard({
  article,
  summary,
}: {
  article: Article;
  summary: Summary | undefined;
}) {
  const imgSrc = article.thumbnail || article.image || null;
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !imgSrc || imgFailed;

  const sourceName = article.source?.name ?? "Unknown";
  const time = relativeTime(article.publishedAt);
  const primaryTopic = article.relevance?.topics?.[0];
  const section = sectionByTopic(primaryTopic);
  const topicLabel = section?.shortTag ?? null;
  const metaBits = [topicLabel, sourceName.toUpperCase(), time].filter(Boolean);

  const excerpt = (summary?.["the panic"]?.trim() || article.description || "").trim();

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
      className="group flex cursor-pointer gap-5 border-b border-white/5 py-5 transition-colors hover:bg-white/[0.03]"
    >
      <div className="relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-lg bg-black/30">
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
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {metaBits.length > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 text-[10px] font-medium tracking-[0.18em] text-white/50">
            {metaBits.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-white/25">·</span>}
                <span className={i === 0 && topicLabel ? "text-red-300/90" : ""}>{b}</span>
              </span>
            ))}
          </p>
        )}

        <h3 className="font-['Libre_Baskerville',serif] text-[17px] font-bold leading-snug text-[#f9f3e6] line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="outline-none hover:text-white"
          >
            {article.title}
          </a>
        </h3>

        {excerpt && (
          <p className="text-[13.5px] leading-snug text-white/65 line-clamp-1">{excerpt}</p>
        )}
      </div>
    </article>
  );
}
