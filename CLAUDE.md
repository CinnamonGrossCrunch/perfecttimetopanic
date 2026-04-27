# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Worrry** (previously "Perfect Time To Panic") — a Next.js 15 (App Router) news aggregator tracking societal threats (climate, AI risk, authoritarianism, pandemic, war/nuclear, economic collapse, disinformation, civil rights, surveillance). Each article is classified for relevance + topics + geographies, summarized into a "panic / hope / action" structure, and then grouped into editorial sections. A flagship **Worrry Editorial** at the top of the homepage is AI-authored via Claude Opus 4.7 as a synthesis across the most urgent articles in the current feed. Deployed on Vercel. Tagline: *"Bad News: Good timing."*

## Commands

- `npm run dev` — Next.js dev server with Turbopack
- `npm run build` — production build (primary way to catch type errors; `tsc` is configured `noEmit`)
- `npm run start` — run the production build
- `npm run lint` — `next lint`
- **Trigger ingestion manually** — `curl http://localhost:3000/api/cron/ingest` (auth-bypassed when `CRON_SECRET` is unset in dev)
- **No test framework is configured** and no unit tests exist. Do not assume `npm test` works.

## Architecture

Two decoupled halves:

1. **Ingestion pipeline** ([lib/buildFeed.ts](lib/buildFeed.ts), cron-driven, writes to Redis `feed` key).
2. **Render path** (server components read `feed` from Redis, pass to client components).

The page should never run the pipeline except as a cold-start safety net.

### Render path

- **Homepage** [app/page.tsx](app/page.tsx) reads `feed` → passes `articles`, `summaries`, `editorial` to [`<ArticleGrid>`](components/ArticleGrid.tsx).
- **Section sub-page** [app/section/\[slug\]/page.tsx](app/section/[slug]/page.tsx) — filters the feed by a single topic (e.g. `/section/democracy-in-crisis`).
- **Region sub-page** [app/region/\[slug\]/page.tsx](app/region/[slug]/page.tsx) — filters by subject geography (e.g. `/region/middle-east`).

#### Homepage layout (ProPublica broadsheet — 3-6-3 grid)

[`<ArticleGrid>`](components/ArticleGrid.tsx) is a **Server Component** (no `"use client"`). Layout from top to bottom:

1. **Masthead** — date kicker → serif `Worrry.` wordmark (~104px) → italic tagline → 4px solid black rule.
2. **Above-the-fold 3-6-3 grid** (`grid grid-cols-1 lg:grid-cols-12`):
   - **Left rail** (`lg:col-span-3`) — `Latest Threats` section header + `LEFT_RAIL_COUNT` (4) `<ListCard variant="rail-text">` (text-only, no thumbnail).
   - **Center stage** (`lg:col-span-6`) — `<EditorialCard>` when present, else `<ArticleCard variant="hero">` from the top-scored article.
   - **Right rail** (`lg:col-span-3`) — `Featured` section header + `RIGHT_RAIL_COUNT` (4) `<ListCard variant="rail-thumb">` (60px thumbnail), then a `Respond / Reclaim` block of static text links.
3. **More Coverage** — next `SECONDARY_COUNT` (6) articles in a `grid md:grid-cols-2 lg:grid-cols-3` of `<ArticleCard variant="compact">`.
4. **Briefs** — next `MORE_COUNT` (12) articles in a 2-col `<ListCard>` grid.
5. **Browse by threat** — `<TopicsNav>` tile grid linking to `/section/<slug>`.

Layout constants at the top of [ArticleGrid.tsx](components/ArticleGrid.tsx): `LEFT_RAIL_COUNT`, `RIGHT_RAIL_COUNT`, `SECONDARY_COUNT`, `MORE_COUNT`.

#### Shared components

- [`<SiteHeader variant="home" | "page">`](components/SiteHeader.tsx) — fixed thin white header (`bg-white/95 border-b border-gray-300`). `home` hides the center wordmark (masthead renders it below); `page` shows `Worrry.` in serif. Left: red globe dropdown with region links. Right: article count.
- [`<EditorialCard>`](components/EditorialCard.tsx) — flagship piece occupying the center col-span-6. Flat article block (no card chrome): 16:9 image with anchored red `Worrry Editorial` chip, oversized serif headline, italic subhead, lede. Expands in-place via CSS Grid `grid-template-rows: 0fr → 1fr` trick. `"use client"` (expand state).
- [`<ArticleCard variant="hero" | "compact">`](components/ArticleCard.tsx) — **vertical stack** layout for both variants (image on top, content below). `hero`: `aspect-[16/9]` image, `text-3xl md:text-4xl` headline. `compact`: `aspect-[4/3]` image, `text-xl` headline. Red kicker tag, Panic left-rule, Hope italic, sharp-corner red Action button. `"use client"` (drag + image-error state).
- [`<ListCard variant="default" | "rail-text" | "rail-thumb">`](components/ListCard.tsx) — `default`: 88px thumbnail + title + excerpt (used in Briefs). `rail-text`: text-only, no thumbnail (left rail). `rail-thumb`: 60px thumbnail + title (right rail). `"use client"` (drag + image-error state).
- [`<ActionOverlay>`](components/ActionOverlay.tsx) — isolated `"use client"` component mounted at the bottom of `ArticleGrid`. Owns the red `+` FAB, paywall drag-drop target, and quick-action chip menu. Keeps all interactive state out of the Server Component grid.
- [`<SectionView>`](components/SectionView.tsx) — **used on the sub-pages only**: one hero card + 2-col grid of compact cards. Not used on the homepage.
- [`<ImageFallback>`](components/ImageFallback.tsx) — the `W.` placeholder. Rendered whenever `imgSrc` is missing OR the `<img>` fires `onError`.

### Data flow: sections, topics, geographies

An article's classifier output is `{ score, topics[], geographies[] }`. **An article can appear in multiple sections** (e.g. `["authoritarianism", "civil-rights"]` → shows in Democracy in Crisis AND Human Rights). The feed stores one flat array; section grouping happens at render time via `.topics.includes(sectionTopic)`.

- [lib/sections.ts](lib/sections.ts) — `SECTIONS` array: topic → slug → display label → short tag. Drives homepage section order, section sub-page routes, and the per-card meta tag.
- [lib/regions.ts](lib/regions.ts) — `REGIONS` array: slug → display label. Drives the globe dropdown and region sub-page routes. Classifier geography tags must use these slugs verbatim.

### Panic/Hope/Action visual arc (on [`<ArticleCard>`](components/ArticleCard.tsx))

- **Panic**: red 3px left-rule (`border-red-600`), body weight — the hook. Falls back to `article.description` if the summary is empty.
- **Hope**: italic, muted (`text-gray-500`) — counterweight. Hidden if empty.
- **Action**: parsed from the `[text](url)` markdown in the summary. Link present → solid red CTA button (sharp corners) with arrow. No link → italic body text. Uses a real `<a>` with `stopPropagation` on click/mousedown to prevent the outer card click (and the card's drag-to-paywall) from hijacking.

### Ingestion pipeline — [lib/buildFeed.ts](lib/buildFeed.ts)

1. **Gather** via [lib/fetchAllSources.ts](lib/fetchAllSources.ts) — parallel RSS + GNews (concurrency 4). Dedupe by normalized URL, English-only (`franc`), require an image. ~200–300 raw candidates.
2. **Classify** via [lib/classifyRelevance.ts](lib/classifyRelevance.ts) — batched `gpt-4.1-nano` JSON-mode calls (15 per batch). Returns `{ score, topics[], geographies[] }`. Per-URL cache `relevance-v2:<hash>`.
3. **Filter + rank** — drop anything below `MIN_SCORE = 5`. Sort by score desc, then `publishedAt` desc. Cap at `MAX_ARTICLES = 60`.
4. **Summarize** via `summarizeWithGPT({ url, title, description })` — per-URL cache `summary:<hash>` (indefinite TTL).
5. **Editorial** via `generateEditorial(topArticles)` — Claude Opus 4.7 synthesis; returns `null` gracefully if `ANTHROPIC_API_KEY` is missing or the API fails.
6. **Write** `{ generatedAt, editorial, articles, summaries }` to Redis `feed`.

### Worrry Editorial — [lib/worrryEditorial.ts](lib/worrryEditorial.ts)

- Model: **`gpt-4.1`** (OpenAI). Temperature `0.7`, `max_tokens: 2500`, strict JSON schema output.
- OpenAI **auto-caches** stable prompt prefixes since late 2024 — no explicit `cache_control` needed; the stable system prompt gets ~50%-off reads after the first call.
- Returns `{ headline, subhead, body, imageHint, sourcedFromArticleUrls, generatedAt }`.
- **Graceful fallback**: missing `OPENAI_API_KEY` or any API error → returns `null` and the homepage omits the editorial card. Do not gate the feed on editorial success.
- **Cost** — roughly $0.02 per cron run on `gpt-4.1` (~$6/month at the every-2h cadence).
- **Swap path back to Claude Opus 4.7** — `@anthropic-ai/sdk` is still installed. To restore the original Anthropic version: replace the OpenAI client block with `new Anthropic()`, the API call with `client.messages.create({ model: "claude-opus-4-7", thinking: { type: "adaptive" }, output_config: { effort: "high", format: { type: "json_schema", schema: EDITORIAL_SCHEMA } }, ... })` per the `claude-api` skill's TypeScript reference, and add `ANTHROPIC_API_KEY` to env. Opus 4.7 is stronger for nuanced editorial tone; the swap adds ~$14/mo at this cadence.

### Feeds — [lib/fetchAllSources.ts](lib/fetchAllSources.ts)

- `SUBSTACKS` (17 feeds, mix of `*.substack.com` and custom-domain)
- `BBC_FEEDS` — world / politics / science_and_environment
- `GUARDIAN_FEEDS` — commentisfree, environment, us-politics
- `OPINION_FEEDS` — NYT, WaPo, LAT
- `INVESTIGATIVE_FEEDS` — ProPublica, Intercept, Democracy Now, Grist, Rest of World, Lawfare, Mother Jones, EFF, NTI, Amnesty International
- `MAINSTREAM_FEEDS` — Al Jazeera, NPR, The Hill, Atlantic, Vox, Foreign Affairs (firehoses — classifier filters)
- `RESEARCH_FEEDS` — arXiv cs.CY, cs.AI
- `RSS_APP_FEEDS` — rss.app existential-threat keyword feed

Custom-domain Substacks (e.g. `volts.wtf`, `popular.info`) expose `/feed` at their own domain — include the full URL.

[fetchRSSFeed](lib/fetchRSSFeed.ts) takes the top 8 items per feed. Bumping this increases candidate pool (and classifier cost) linearly.

### Cron — [app/api/cron/ingest/route.ts](app/api/cron/ingest/route.ts) + [vercel.json](vercel.json)

- Schedule: `0 */2 * * *` (every 2 hours).
- Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron injects automatically; dev bypasses when unset).
- `maxDuration = 300` seconds.

### Summarization — [lib/summarizeWithGPT.ts](lib/summarizeWithGPT.ts)

`gpt-4.1-nano`, JSON mode, per-URL cache. Output: `{ "the panic", "the hope", "the action" }`. On parse failure, returns raw text in `"the panic"`; on API error, a sentinel `"⚠️ Summary unavailable due to GPT error."`.

### Caching — [lib/cacheUtils.ts](lib/cacheUtils.ts) & [lib/hash.ts](lib/hash.ts)

| Key | Shape | Lifetime | Writer |
|---|---|---|---|
| `feed` | `{ generatedAt, editorial, articles[], summaries[] }` | refreshed by cron every 2h; page treats >6h old as stale | `buildFeed` |
| `relevance-v2:<hash>` | `{ score, topics[], geographies[] }` | indefinite (clear manually if classifier prompt changes) | `classifyRelevance` |
| `summary:<hash>` | `{ "the panic", "the hope", "the action" }` | indefinite | `summarizeWithGPT` |

`<hash>` = `sha1(normalize(url)).slice(0, 16)` from [lib/hash.ts](lib/hash.ts).

**Note on the `v2` suffix**: the classifier shape changed from `{ score, topic }` (single) to `{ score, topics[], geographies[] }` (multi + region). Old `relevance:*` keys from before that change are ignored; they'll time out or sit idle. If you rev the classifier output again, bump to `relevance-v3:`.

### OG image scraping

`fetchOGImage` exists **twice**:
- [lib/fetchOGImage.ts](lib/fetchOGImage.ts) — `node-fetch`, called by `fetchFromGNews`
- Inline inside [lib/fetchRSSFeed.ts](lib/fetchRSSFeed.ts) — global `fetch`

Both use a 7s `AbortController` timeout and `cheerio` to read `meta[property="og:image"]`. Keep in sync or consolidate.

## Conventions

- **Path alias** — `tsconfig.json` maps `@/*` to the project root.
- **Client vs server boundary** — `ArticleGrid` is a Server Component; individual cards (`ArticleCard`, `ListCard`, `EditorialCard`) and `ActionOverlay` are `"use client"` (drag handlers, image-error state, expand state). Server components in `app/` are under `runtime = "nodejs"` (required — `lib/` uses Node APIs + OpenAI / Anthropic SDKs).
- **Tailwind v4** — [app/globals.css](app/globals.css) uses `@import "tailwindcss"`. Arbitrary values are fine. Custom colors/fonts in [tailwind.config.js](tailwind.config.js). Theme: `--background: #f7f5ef` (paper off-white), `--foreground: #111827` (deep slate), `text-red-600` for all accents.
- **Fonts** — Libre Baskerville (headlines, masthead wordmark, section caps) + Geist (default sans, meta/body) + Playfair Display (available, not currently used in primary layout). Fair Play is no longer used.

## Required environment variables

- `OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_ORG_ID` — summaries, classifier, and editorial
- `GNEWS_API_KEY` — GNews article search
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Redis cache
- `CRON_SECRET` — shared secret for the cron endpoint. **Production-only**; omit locally to bypass.
- `ANTHROPIC_API_KEY` — **not currently used**. Required only if you swap editorial generation back to Claude Opus 4.7 per the note in the Worrry Editorial section.

## Tuning knobs

- `MIN_SCORE` in [lib/buildFeed.ts](lib/buildFeed.ts) — relevance threshold (`5` = adjacent, `6` = topic-relevant)
- `MAX_ARTICLES` in [lib/buildFeed.ts](lib/buildFeed.ts) — caps summarization + editorial input
- `EDITORIAL_INPUT_SIZE` in [lib/buildFeed.ts](lib/buildFeed.ts) — top-N articles fed to Claude
- `effort` in [lib/worrryEditorial.ts](lib/worrryEditorial.ts) — currently `"high"`. Drop to `"medium"` to cut cost, raise to `"xhigh"` for more synthesis depth
- `BATCH` in [lib/classifyRelevance.ts](lib/classifyRelevance.ts) — classifier batch size
- `SECTIONS` in [lib/sections.ts](lib/sections.ts) — topic → display order, label, slug
- `REGIONS` in [lib/regions.ts](lib/regions.ts) — geography dropdown + route slugs
- `schedule` in [vercel.json](vercel.json) — cron frequency (hourly minimum on hobby tier)

## Future TODOs

- **Sub-page light-mode conversion** — `app/section/[slug]/page.tsx`, `app/region/[slug]/page.tsx`, and [`<SectionView>`](components/SectionView.tsx) still have dark wrappers. The cards inside them are now light-themed (they share `ArticleCard`/`ListCard`), so there's a visible mismatch. Convert the wrapper chrome (section headers, page bg) to match the broadsheet palette.
- **Intelligent free-use image sourcing for the editorial** — currently uses the top article's OG image. The editorial carries an `imageHint` field that describes a better editorial image. Integrate with Unsplash or Wikimedia API to pull a matching free-use image, respecting attribution.
- **Article open in iframe/modal** — clicks currently open in a new tab. Most news sites set `X-Frame-Options: DENY` / `frame-ancestors` — needs graceful fallback. Also needs a modal architecture that doesn't break the drag-to-paywall flow.
- **Auto-sorting evolution** — ranking currently uses classifier score then date. Future: freshness decay, source authority weighting, cross-topic convergence signals, user-facing dials.
- **Accountability topic** — ProPublica / Intercept / Mother Jones pieces about corruption and regulatory capture often score <5 because they don't cleanly match the current 9 topics. Consider adding an `accountability` classification target.
- **Per-section pagination** — section sub-pages already handle the "show everything" case; the Briefs tier on the homepage could link to them instead of rendering all 12 inline.
- **OG image rebrand** — [app/layout.tsx](app/layout.tsx) still references `/PTTP2.jpg` as the OG / Twitter card image. Replace with a Worrry broadsheet image when available.

## Gotchas / dead code

- [components/AnimatedBackground.tsx](components/AnimatedBackground.tsx) — the dark red/orange animated gradient. No longer imported after the broadsheet refactor. Safe to delete.
- [components/FloatingToDoPanel.jsx](components/FloatingToDoPanel.jsx) is plain JSX, persists to `localStorage`, and is currently not imported anywhere. Dead weight.
- [app/api/route.ts](app/api/route.ts) + [app/api/\[...all\]/](app/api/) — the catchall directory is empty and the top-level route returns 404. Real API route is `/api/cron/ingest`.
- [react-todo-list/](react-todo-list/) is a git submodule — separate vendored project, not part of the Next.js app.
- [path/to/](path/) is an empty placeholder directory from an earlier scaffolding mistake.
- **Historical note**: a `lib/fetchNews.ts` file existed with a hardcoded GNews API key. It was deleted, but the key is still in git history — **rotate the GNews key** at gnews.io if it was ever real.
