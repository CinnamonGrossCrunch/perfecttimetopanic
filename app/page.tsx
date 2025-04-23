export const runtime = "nodejs"; // Ensure Node runtime (not edge)

import { fetchNews } from "../lib/fetchNews"; // use relative path to avoid aliasing issues
import Image from "next/image";

// TypeScript type for each article from GNews
type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

export default async function Home() {
  const articles: Article[] = await fetchNews(); // get real articles

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-6xl font-bold text-red-600 animate-pulse text-center sm:text-left">
          Perfect Time to Panic
        </h1>

        <p className="max-w-xl text-gray-300 text-center sm:text-left text-lg sm:text-xl">
          A live feed of stories tracking the slow erosion of democratic order, ecological collapse,
          artificial intelligence risk, economic unraveling, and other delightful omens of human decline.
        </p>

        <div className="rounded-xl border border-red-600 px-6 py-4 text-sm bg-red-900 bg-opacity-20">
          <span className="text-red-300">🚨 PANIC LEVEL:</span>{" "}
          <strong>Moderate → Rising</strong>
        </div>

        <section className="w-full max-w-4xl mt-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 border-b border-gray-700 pb-2">
            Latest Existential Threats
          </h2>

          {articles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article: Article, idx: number) => (
                <a
                  key={idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white bg-opacity-5 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2 text-red-400">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-300">{article.description}</p>
                  <p className="text-xs mt-2 text-right text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()} &middot;{" "}
                    {article.source.name}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No panic-worthy stories found.</p>
          )}
        </section>

        <div className="text-sm text-gray-400 italic mt-8">
          [Live news updating from GNews — refreshing every time you visit.]
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-gray-500">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Powered by paranoia + Next.js
        </a>
      </footer>
    </div>
  );
}
