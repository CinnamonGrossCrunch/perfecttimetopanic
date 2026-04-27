"use client";

import Link from "next/link";
import { SECTIONS } from "../lib/sections";

export function TopicsNav({ counts }: { counts: Record<string, number> }) {
  const available = SECTIONS.filter((s) => (counts[s.topic] ?? 0) > 0);
  if (available.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 border-b-4 border-black pb-3 font-['Libre_Baskerville',serif] text-2xl font-bold uppercase tracking-wider text-gray-900">
        Browse by threat
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {available.map((s) => (
          <Link
            key={s.slug}
            href={`/section/${s.slug}`}
            className="group flex items-center justify-between gap-3 border border-gray-300 bg-white px-4 py-3 transition-colors hover:border-red-600 hover:bg-gray-50"
          >
            <span className="font-['Libre_Baskerville',serif] text-[15px] font-bold text-gray-900 transition-colors group-hover:text-red-600">
              {s.label}
            </span>
            <span className="flex-shrink-0 text-[11px] font-medium tracking-[0.12em] text-gray-500">
              {counts[s.topic]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
