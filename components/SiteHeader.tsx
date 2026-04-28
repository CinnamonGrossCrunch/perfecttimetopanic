"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { REGIONS } from "../lib/regions";
import { SECTIONS } from "../lib/sections";

type Variant = "home" | "page";

export function SiteHeader({ variant }: { variant: Variant }) {
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const regionsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const isHome = variant === "home";

  useEffect(() => {
    if (!regionsOpen && !sectionsOpen) return;
    function onDown(e: MouseEvent) {
      if (regionsRef.current && !regionsRef.current.contains(e.target as Node)) setRegionsOpen(false);
      if (sectionsRef.current && !sectionsRef.current.contains(e.target as Node)) setSectionsOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") { setRegionsOpen(false); setSectionsOpen(false); }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [regionsOpen, sectionsOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-300 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-3">

        {/* Left: globe / regions dropdown */}
        <div ref={regionsRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={regionsOpen}
            aria-label="Browse by region"
            onClick={() => { setRegionsOpen((v) => !v); setSectionsOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-gray-100 hover:text-red-700"
          >
            <GlobeIcon />
          </button>
          {regionsOpen && (
            <div role="menu" className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden border border-gray-300 bg-white shadow-lg">
              <div className="border-b border-gray-200 px-4 pt-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Threats by region
              </div>
              {REGIONS.map((r) => (
                <Link key={r.slug} href={`/region/${r.slug}`} role="menuitem"
                  onClick={() => setRegionsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 hover:text-red-600">
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Center: always show on mobile; hidden on desktop home (masthead wordmark handles it) */}
        <div className="flex-1 text-center">
          <Link
            href="/"
            className={`font-['Libre_Baskerville',serif] text-2xl font-bold leading-none tracking-tight text-gray-900 transition-opacity hover:opacity-70${isHome ? " lg:hidden" : ""}`}
          >
            Worrry<span className="text-red-600">.</span>
          </Link>
        </div>

        {/* Right: sections menu on mobile; about icon on desktop home */}
        <div className="flex min-w-[100px] items-center justify-end gap-1">

          {/* Mobile topics/sections menu — hidden on desktop */}
          <div ref={sectionsRef} className="relative lg:hidden">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={sectionsOpen ? true : false}
              aria-label="Browse by topic"
              onClick={() => { setSectionsOpen((v) => !v); setRegionsOpen(false); }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-gray-100 hover:text-red-700"
            >
              <MenuIcon />
            </button>
            {sectionsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden border border-gray-300 bg-white shadow-lg">
                <div className="border-b border-gray-200 px-4 pt-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Browse by threat
                </div>
                {SECTIONS.map((s) => (
                  <Link key={s.slug} href={`/section/${s.slug}`}
                    onClick={() => setSectionsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 hover:text-red-600">
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop about icon — hidden on mobile */}
          {isHome && (
            <Link href="/about" aria-label="About Worrry"
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-gray-100 hover:text-red-700">
              <InfoIcon />
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
