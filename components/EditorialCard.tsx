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
    <section className="relative mt-8 overflow-hidden rounded-3xl bg-[#15100e]/85 ring-1 ring-white/10 backdrop-blur-md">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-black/40">
        {showImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl!}
              alt=""
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#15100e] via-[#15100e]/40 to-transparent" />
          </>
        )}
        {showFallback && <ImageFallback />}
        <div className="absolute left-6 top-5 inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Worrry Editorial
        </div>
      </div>

      <div className="px-6 pb-8 pt-6 md:px-10 md:pb-10 md:pt-8">


        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          By Worrry editorial · {relativeTime(editorial.generatedAt)}
        </p>

        <h2 className="mt-3 font-['Libre_Baskerville',serif] text-3xl font-bold leading-[1.1] text-[#f9f3e6] md:text-[40px]">
          {editorial.headline}
        </h2>

        <p className="mt-4 font-['Libre_Baskerville',serif] text-lg italic leading-snug text-white/75 md:text-xl">
          {editorial.subhead}
        </p>

        {lede && (
          <p className="mt-6 text-[15.5px] leading-[1.7] text-white/90 md:text-base">{lede}</p>
        )}

        {rest.length > 0 && (
          <>
            <div
              className="grid transition-[grid-template-rows] duration-700 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              aria-hidden={!expanded ? "true" : "false"}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-4 pt-4 text-[15.5px] leading-[1.7] text-white/90 md:text-base">
                  {rest.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded ? "true" : "false"}
              className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-red-300 transition-colors hover:text-red-200"
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
    </section>
  );
}
