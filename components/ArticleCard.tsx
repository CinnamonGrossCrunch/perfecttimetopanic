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

  const primaryTopic = article.relevance?.topics?.[0];
  const section = sectionByTopic(primaryTopic);
  const topicLabel = section?.shortTag ?? null;

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
      className="group flex cursor-pointer flex-col"
    >
      <div
        className={`relative w-full overflow-hidden bg-gray-200 ${
          isHero ? "aspect-[16/9]" : "aspect-[4/3]"
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>

      <div className={`flex flex-col ${isHero ? "mt-5 gap-4" : "mt-3 gap-2.5"}`}>
        {topicLabel && (
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-red-600">
            {topicLabel}
          </p>
        )}

        <h3
          className={`font-['Libre_Baskerville',serif] font-bold leading-[1.15] text-gray-900 ${
            isHero ? "text-3xl md:text-4xl" : "text-xl"
          }`}
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="outline-none transition-colors hover:text-red-700 focus-visible:underline"
          >
            {article.title}
          </a>
        </h3>

        {summary && (
          <div
            className={`flex flex-col gap-2 leading-[1.55] text-gray-700 ${
              isHero ? "text-[16px]" : "text-[14px]"
            }`}
          >
            {(summary["the panic"] || article.description) && (
              <p className="border-l-[3px] border-red-600 pl-3">
                {summary["the panic"]?.trim() ? summary["the panic"] : article.description}
              </p>
            )}
            {summary["the hope"]?.trim() && (
              <p className="pl-3 italic text-gray-500">{summary["the hope"]}</p>
            )}
          </div>
        )}

        <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-gray-500">
          {sourceName} · {time}
        </p>

        {action?.href && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex w-fit items-center gap-2 bg-red-600 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
          >
            {action.text}
            <span aria-hidden="true">→</span>
          </a>
        )}
        {action && !action.href && (
          <p className="text-[14px] italic text-gray-600">{action.text}</p>
        )}
      </div>
    </article>
  );
}
