"use client";

import Link from "next/link";
import { SECTIONS } from "../lib/sections";

export function TopicsNav({ counts }: { counts: Record<string, number> }) {
  const available = SECTIONS.filter((s) => (counts[s.topic] ?? 0) > 0);
  if (available.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 border-b border-white/10 pb-3 font-['Libre_Baskerville',serif] text-[22px] font-bold text-[#f9f3e6]">
        Browse by threat
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {available.map((s) => (
          <Link
            key={s.slug}
            href={`/section/${s.slug}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#15100e]/60 px-4 py-3 transition-colors hover:border-white/30 hover:bg-[#1a1412]/80"
          >
            <span className="font-['Libre_Baskerville',serif] text-[15px] font-bold text-[#f9f3e6] transition-colors group-hover:text-white">
              {s.label}
            </span>
            <span className="flex-shrink-0 text-[11px] font-medium tracking-[0.12em] text-white/40">
              {counts[s.topic]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
