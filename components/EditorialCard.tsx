"use client";

import { useState, useRef } from "react";
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

function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
}

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function AudioPlayer({
  audioUrl,
  headline,
  body,
}: {
  audioUrl: string | null;
  headline: string;
  body: string;
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(audioUrl);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function getUrl(): Promise<string | null> {
    if (resolvedUrl) return resolvedUrl;
    try {
      const res = await fetch("/api/editorial-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, body }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResolvedUrl(url);
      return url;
    } catch {
      return null;
    }
  }

  async function handlePlayPause() {
    if (state === "playing" && audioRef.current) {
      audioRef.current.pause();
      setState("paused");
      return;
    }
    if (state === "paused" && audioRef.current) {
      audioRef.current.play();
      setState("playing");
      return;
    }
    setState("loading");
    const url = await getUrl();
    if (!url) { setState("idle"); return; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("canplay", () => { audio.play(); setState("playing"); });
    audio.addEventListener("ended", () => { setState("idle"); setCurrentTime(0); });
    audio.addEventListener("error", () => setState("idle"));
    audio.load();
  }

  function skip(secs: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }

  const canSkip = state === "playing" || state === "paused";

  return (
    <div className="flex flex-col gap-2 border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => skip(-15)}
          disabled={!canSkip}
          aria-label="Back 15 seconds"
          className="shrink-0 text-[11px] font-bold text-gray-500 transition-colors hover:text-red-600 disabled:opacity-30"
        >
          ←15s
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          disabled={state === "loading"}
          aria-label={state === "playing" ? "Pause" : "Play"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {state === "loading" ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : state === "playing" ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <rect x="1.5" y="1" width="3.5" height="10" rx="1" />
              <rect x="7" y="1" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 translate-x-[1px]" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(15)}
          disabled={!canSkip}
          aria-label="Forward 15 seconds"
          className="shrink-0 text-[11px] font-bold text-gray-500 transition-colors hover:text-red-600 disabled:opacity-30"
        >
          15s→
        </button>

        <span className="font-mono text-[11px] text-gray-500">
          {fmt(currentTime)}{duration > 0 ? ` / ${fmt(duration)}` : ""}
        </span>

        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Listen
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 100}
        step={0.5}
        value={currentTime}
        onChange={handleSeek}
        disabled={!canSkip}
        aria-label="Audio position"
        className="w-full cursor-pointer accent-red-600 disabled:opacity-30"
      />
    </div>
  );
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

  const footnotes = editorial.footnotes ?? [];

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-200">
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {showFallback && <ImageFallback />}
        <span className="absolute left-0 top-0 hidden lg:inline-flex items-center gap-2 bg-red-600 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          Worrry Editorial
        </span>
      </div>

      <div className="mt-5">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
            By Worrry editorial · {relativeTime(editorial.generatedAt)}
          </p>
          <AudioPlayer
            audioUrl={editorial.audioUrl}
            headline={editorial.headline}
            body={editorial.body}
          />
        </div>

        <h2 className="mt-3 line-clamp-2 lg:line-clamp-none font-['Libre_Baskerville',serif] text-[40px] font-bold leading-[1.05] tracking-tight text-gray-900 md:text-[52px]">
          {editorial.headline}
        </h2>

        <p className="mt-4 font-['Libre_Baskerville',serif] text-xl italic leading-snug text-gray-700 md:text-[22px]">
          {editorial.subhead}
        </p>

        {lede && (
          <p className="mt-5 text-[16px] leading-[1.65] text-gray-800">
            {stripCitations(lede)}
          </p>
        )}

        {rest.length > 0 && (
          <>
            <div
              className={`grid transition-[grid-template-rows] duration-700 ease-out motion-reduce:transition-none ${expanded ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"}`}
              aria-hidden={expanded ? false : true}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-4 pt-4 text-[16px] leading-[1.65] text-gray-800">
                  {rest.map((p, i) => (
                    <p key={i}>{stripCitations(p)}</p>
                  ))}
                </div>

                {footnotes.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                      Sources
                    </p>
                    <ol className="flex flex-col gap-2">
                      {footnotes.map((fn) => (
                        <li key={fn.number} className="flex gap-2 text-[12px] leading-snug text-gray-600">
                          <span className="shrink-0 font-bold text-red-600">[{fn.number}]</span>
                          <a
                            href={fn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-red-600 hover:underline"
                          >
                            {fn.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded ? true : false}
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
