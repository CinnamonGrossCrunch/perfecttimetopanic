"use client";

import { useState } from "react";
import type { Editorial } from "../lib/worrryEditorial";
import { ImageFallback } from "./ImageFallback";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function EditorialCard({
  editorial,
  imageUrl,
}: {
  editorial: Editorial;
  imageUrl?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = imageUrl && !imgFailed;
  const showFallback = !imageUrl || imgFailed;

  const paragraphs = editorial.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [lede, ...rest] = paragraphs;

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-200">
        {showImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl!}
              alt=""
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        )}
        {showFallback && <ImageFallback />}
        <span className="absolute left-0 top-0 inline-flex items-center gap-2 bg-red-600 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Worrry Editorial
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
          By Worrry editorial · {relativeTime(editorial.generatedAt)}
        </p>

        <h2 className="mt-3 font-['Libre_Baskerville',serif] text-[40px] font-bold leading-[1.05] tracking-tight text-gray-900 md:text-[52px]">
          {editorial.headline}
        </h2>

        <p className="mt-4 font-['Libre_Baskerville',serif] text-xl italic leading-snug text-gray-700 md:text-[22px]">
          {editorial.subhead}
        </p>

        {lede && (
          <p className="mt-5 text-[16px] leading-[1.65] text-gray-800">{lede}</p>
        )}

        {rest.length > 0 && (
          <>
            <div
              className="grid transition-[grid-template-rows] duration-700 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              aria-hidden={!expanded}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-4 pt-4 text-[16px] leading-[1.65] text-gray-800">
                  {rest.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-5 inline-flex items-center gap-2 border-b-2 border-red-600 pb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-red-600 transition-colors hover:text-red-700"
            >
              {expanded ? "Collapse" : "Read the full editorial"}
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              >
                ↓
              </span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}
