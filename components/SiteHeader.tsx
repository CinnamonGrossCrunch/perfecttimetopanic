"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { REGIONS } from "../lib/regions";

type Variant = "home" | "page";

export function SiteHeader({
  variant,
  articleCount,
}: {
  variant: Variant;
  articleCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const isHome = variant === "home";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-black/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* Left: globe dropdown */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
            aria-label="Browse by region"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-white/10 hover:text-red-400"
          >
            <GlobeIcon />
          </button>
          {open && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-2 min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#15100e]/95 backdrop-blur-md shadow-2xl"
            >
              <div className="px-4 pt-3 pb-2 text-[10.5px] uppercase tracking-[0.18em] text-white/40">
                Threats by region
              </div>
              {REGIONS.map((r) => (
                <Link
                  key={r.slug}
                  href={`/region/${r.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Center: wordmark (only on sub-pages; the homepage renders a huge one below the header) */}
        <div className="flex-1 text-center">
          {!isHome && (
            <Link
              href="/"
              className="font-['Fair_Play',serif] text-2xl leading-none tracking-tight text-[#FFF8E0] transition-opacity hover:opacity-80"
            >
              Worrry
            </Link>
          )}
        </div>

        {/* Right: article count */}
        <div className="min-w-[100px] text-right text-[10.5px] uppercase tracking-[0.2em] text-white/35">
          {typeof articleCount === "number" ? `${articleCount} tracked` : ""}
        </div>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
