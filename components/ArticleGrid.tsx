"use client";

import { useState } from "react";

type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

type Props = {
  articles: Article[];
  summaries: string[];
};

export default function ArticleGrid({ articles, summaries }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMore = () => setVisibleCount((count) => count + 6);

  return (
    <div className="relative min-h-screen font-sans text-foreground overflow-hidden">
      {/* Background: noise texture + soft pastel gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-[url('/noise.png')] bg-repeat opacity-25 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#fefcfb] via-[#e8ecf9] to-[#dee5f3] opacity-30"></div>
      </div>

      {/* Header */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/PTTP.jpg"
          alt=""
          className="w-full object-cover object-center opacity-100 "

          draggable={false}
        />
      </div>
      <header className="relative z-10 max-w-3xl mx-auto text-left space-x-0 pt-20 px-2 sm:px-0">
        <p className="text-sm italic text-stone mt-2 drop-shadow-2xl shadow-black/70">
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold text-accent tracking-tight drop-shadow-2xl shadow-black/100">
          Perfect Time to Panic
        </h1>
        <p className="text-lg sm:text-xl text-calm max-w-xl mx-0 drop-shadow-[0_1px_5px_rgba(0,0,0,1)] shadow-black/100">
          Your curated dashboard of humanity's existential threats —
          <br />
          Not to spiral, but to stay sharp.
          <br />
          Not to fear, but to focus.
          <br />
          A "Perfect Time to Panic" — because action beats apathy.
        </p>
       
      </header>

      {/* Articles Grid */}
      <main className="relative z-10 mt-20 grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto px-6">
        {articles.slice(0, visibleCount).map((article, idx) => (
            <a
            key={idx}
            href={article.url}
            target="_blank"
            rel="noopener"
            className="flex flex-col justify-between min-h-[350px] p-8 rounded-3xl bg-white/50 backdrop-blur-md shadow-glow transition text-[#23272f]" // darker, grayer font
            >
            <h3 className="text-accent font-mono text-2xl mb-4 font-mEDium">
            {article.title}
            </h3>
            <p className="text-md flex-1 text-[#3a3d45]">
            {summaries[idx] || article.description}
            </p>
            <p className="text-xs mt-4 text-right text-stone-500">
            {new Date(article.publishedAt).toLocaleDateString()} &middot; {article.source.name}
            </p>
            </a>
        ))}
      </main>

      {/* Load More */}
      {visibleCount < articles.length && (
        <div className="relative z-10 text-center mt-10">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-accent text-white rounded-lg shadow hover:bg-red-500 transition"
          >
            See More
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center text-sm text-stone mt-32 pb-12 px-6">
        <p>Curated resistance. Calm vigilance. Awareness is power.</p>
      </footer>
    </div>
  );
}
