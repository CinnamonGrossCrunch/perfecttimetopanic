# Copilot Instructions — Perfect Time To Panic

## Project Overview
A Next.js 15 (App Router) news aggregator that curates articles about societal threats (climate, AI, authoritarianism, etc.), summarizes each via OpenAI into a structured "panic/hope/action" format, and presents them in a dramatic, dark-themed card grid. Deployed on Vercel.

## Architecture & Data Flow
1. **Server-side fetch** — `app/page.tsx` is an async Server Component (`runtime = "nodejs"`). It calls `fetchAllSources()` then `summarizeWithGPT()` per article, passing results to the client `<ArticleGrid>`.
2. **Multi-source ingestion** (`lib/fetchAllSources.ts`) — Aggregates GNews API + RSS feeds (Substacks, Medium tags, opinion columns, BBC, Al Jazeera, rss.app). Medium tags rotate every 3 hours via `rotateTagsEvery3Hours()`. RSS fetches are sequential with 500ms throttle.
3. **Filtering pipeline** — Deduplicates by URL → filters to English (`franc`) → requires image/thumbnail → excludes unwanted Medium tags → applies sentiment analysis (`sentiment`) to gate AI-topic articles (must be negative) → tags op-eds.
4. **Caching** — Upstash Redis (`lib/cacheUtils.ts`). Articles cached for 3 hours under key `"articles"`. `fetchWithCache` wrapper in `lib/fetchWithCache.ts` provides a generic TTL cache pattern.
5. **GPT summaries** (`lib/summarizeWithGPT.ts`) — Uses `gpt-4.1-nano` to produce `{ "the panic", "the hope", "the action" }` JSON per article. Handles variant key formats (snake_case, camelCase) in parsing.
6. **OG image scraping** (`lib/fetchOGImage.ts`, also duplicated inside `lib/fetchRSSFeed.ts`) — Fetches HTML and extracts `og:image` with cheerio; 7s AbortController timeout.

## Key Conventions
- **`@/*` path alias** — tsconfig maps `@/*` to project root. Use `@/components/...`, `@/lib/...` in imports.
- **Client vs Server** — Only `components/` files use `"use client"`. `app/page.tsx` and `lib/` are server-only. Never add `"use client"` to lib files.
- **Tailwind v4** — Uses `@import "tailwindcss"` in `globals.css` (not `@tailwind` directives). Custom utilities go in `@layer utilities {}`. Tailwind config in `tailwind.config.js` defines custom colors (`foreground`, `calm`, `stone`), fonts (`sans`=Geist, `serif`=Libre Baskerville/Playfair), and background images (`noise`, `space`, `pastel-noise`).
- **Fonts** — Geist (sans), Geist Mono, Libre Baskerville, and Playfair Display loaded via `next/font/google` in `layout.tsx`. Headline font is `Fair Play` (referenced in inline styles as `fontFamily: "Fair Play, serif"`).
- **CSS animations** — `globals.css` contains `rainbow-border-animate`, `flicker`, `conic-border-wrapper`, `rainbow-spin` keyframes. Animated gradient background is in `AnimatedBackground.tsx` (dark red/orange/black palette, `requestAnimationFrame` loop).
- **Component patterns** — `FloatingToDoPanel.jsx` is plain JSX (not TypeScript). It persists todos to `localStorage`. Currently commented out in `ArticleGrid.tsx`.

## Environment Variables (required)
- `OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_ORG_ID` — OpenAI for summaries
- `GNEWS_API_KEY` — GNews article search
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis cache

## Dev Workflow
- `npm run dev` — Runs Next.js dev with Turbopack
- `npm run build` — Production build (catches type errors)
- No test framework is configured; no unit tests exist
- Deployed via Vercel (Vercel Analytics is wired in `layout.tsx`)

## Gotchas
- `fetchOGImage` is duplicated: standalone in `lib/fetchOGImage.ts` (uses `node-fetch`) and inline in `lib/fetchRSSFeed.ts` (uses global `fetch`). Keep both in sync or consolidate.
- `lib/fetchNews.ts` contains a **hardcoded API key** and is not imported anywhere — appears to be dead code.
- Article type is defined inline in both `app/page.tsx` and `components/ArticleGrid.tsx` — keep them in sync or extract to a shared type.
- The `react-todo-list/` directory is a separate vendored project (has its own `package.json`, gulp build). It is not part of the Next.js app.
- GPT summary parsing is lenient: falls back to raw text if JSON parsing fails. The `"the action"` field may contain markdown links transformed to HTML via `markdownToHtml()` with `dangerouslySetInnerHTML`.
