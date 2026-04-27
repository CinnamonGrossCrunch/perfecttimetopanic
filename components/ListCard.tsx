"use client";

import { useState } from "react";
import { sectionByTopic } from "../lib/sections";
import { relativeTime } from "../lib/cardHelpers";
import { ImageFallback } from "./ImageFallback";
import type { Article, Summary } from "./ArticleCard";

type Variant = "default" | "rail-text" | "rail-thumb";

export function ListCard({
  article,
  summary,
  variant = "default",
}: {
  article: Article;
  summary: Summary | undefined;
  variant?: Variant;
}) {
  const imgSrc = article.thumbnail || article.image || null;
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !imgSrc || imgFailed;

  const sourceName = article.source?.name ?? "Unknown";
  const time = relativeTime(article.publishedAt);
  const primaryTopic = article.relevance?.topics?.[0];
  const section = sectionByTopic(primaryTopic);
  const topicLabel = section?.shortTag ?? null;

  const excerpt = (summary?.["the panic"]?.trim() || article.description || "").trim();

  const isRailText = variant === "rail-text";
  const isRailThumb = variant === "rail-thumb";
  const isRail = isRailText || isRailThumb;

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
      className={`group flex cursor-pointer gap-4 border-b border-gray-300 transition-colors hover:bg-gray-100 ${
        isRail ? "py-3" : "py-5"
      }`}
    >
      {!isRailText && (
        <div
          className={`relative flex-shrink-0 overflow-hidden bg-gray-200 ${
            isRailThumb ? "h-[60px] w-[60px]" : "h-[88px] w-[88px]"
          }`}
        >
          {showFallback ? (
            <ImageFallback />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imgSrc!}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        {topicLabel && (
          <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-red-600">
            {topicLabel}
          </p>
        )}

        <h3
          className={`font-['Libre_Baskerville',serif] font-bold leading-snug text-gray-900 line-clamp-3 ${
            isRail ? "text-[15px]" : "text-[17px]"
          }`}
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="outline-none transition-colors hover:text-red-700"
          >
            {article.title}
          </a>
        </h3>

        {!isRail && excerpt && (
          <p className="text-[13.5px] leading-snug text-gray-600 line-clamp-2">{excerpt}</p>
        )}

        <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-gray-500">
          {sourceName} · {time}
        </p>
      </div>
    </article>
  );
}
