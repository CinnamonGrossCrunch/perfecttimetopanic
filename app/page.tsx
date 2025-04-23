import { fetchNews } from "@/lib/fetchNews";
import Image from "next/image";

export default function Home() {
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
          <span className="text-red-300">🚨 PANIC LEVEL:</span> <strong>Moderate → Rising</strong>
        </div>
        <section className="w-full max-w-4xl mt-12">
  <h2 className="text-2xl sm:text-3xl font-semibold mb-6 border-b border-gray-700 pb-2">
    Latest Existential Threats
  </h2>

  {/* Placeholder cards for stories */}
  <div className="grid gap-6 sm:grid-cols-2">
    <div className="bg-white bg-opacity-5 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold mb-2 text-red-400">Climate Crisis Escalates</h3>
      <p className="text-sm text-gray-300">
        UN report warns of irreversible tipping points. Global cooperation faltering.
      </p>
    </div>

    <div className="bg-white bg-opacity-5 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold mb-2 text-yellow-400">AI Alignment Breakdown?</h3>
      <p className="text-sm text-gray-300">
        Leaked memo suggests leading AI lab rushed deployment despite ethical red flags.
      </p>
    </div>
  </div>
</section>
        <div className="text-sm text-gray-400 italic">
          [Soon this will auto-update with live existential threat news...]
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-gray-500">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Powered by paranoia + Next.js
        </a>
      </footer>
    </div>
  );
}
