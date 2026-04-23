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

#### Homepage layout (ProPublica-style tiered hierarchy)

The homepage [`<ArticleGrid>`](components/ArticleGrid.tsx) is vertically tiered — NOT grouped by topic. The topic grouping lives on the sub-pages.

1. **Hero tier** — the single top-scored article, rendered as a wide `<ArticleCard variant="hero">` (image left ~45%, content right).
2. **Featured Stories** — next `FEATURED_COUNT` (6) articles in a 2-column grid of `<ArticleCard variant="compact">`.
3. **More Stories** — next `MORE_COUNT` (15) articles as `<ListCard>` — a dense single-column list with 88px square thumbnail (or `W.` fallback), topic/source/time meta, title, one-line excerpt.
4. **Browse by threat** — `<TopicsNav>` — tile grid of topic sections with article counts linking to `/section/<slug>`.

Layout knobs are the `FEATURED_COUNT` / `MORE_COUNT` constants at the top of [ArticleGrid.tsx](components/ArticleGrid.tsx).

#### Shared components

- [`<SiteHeader variant="home" | "page">`](components/SiteHeader.tsx) — fixed thin header. `home` hides the wordmark (rendered huge in the hero below); `page` shows "Worrry" centered. Left side always has the red globe-icon dropdown with region links.
- [`<EditorialCard>`](components/EditorialCard.tsx) — flagship piece at the top of the homepage. Truncated to a lede on load; expands in-place via the modern CSS Grid `grid-template-rows: 0fr → 1fr` trick (no JS height measurement).
- [`<ArticleCard variant="hero" | "compact">`](components/ArticleCard.tsx) — landscape card. Image left on `md+`, stacked on mobile. Meta row (TOPIC · SOURCE · relative time) → serif title wrapped in an `<a>` → Panic/Hope/Action arc.
- [`<ListCard>`](components/ListCard.tsx) — dense horizontal list row. Uses the same helpers as ArticleCard via [lib/cardHelpers.ts](lib/cardHelpers.ts). No Panic/Hope/Action — just title + excerpt + meta.
- [`<SectionView>`](components/SectionView.tsx) — **used on the sub-pages only**: one hero card + 2-col grid of compact cards. Section header is a link to `/section/<slug>`. Not used on the homepage anymore.
- [`<ImageFallback>`](components/ImageFallback.tsx) — the `W.` placeholder. Rendered whenever `imgSrc` is missing OR the `<img>` fires `onError`.

### Data flow: sections, topics, geographies

An article's classifier output is `{ score, topics[], geographies[] }`. **An article can appear in multiple sections** (e.g. `["authoritarianism", "civil-rights"]` → shows in Democracy in Crisis AND Human Rights). The feed stores one flat array; section grouping happens at render time via `.topics.includes(sectionTopic)`.

- [lib/sections.ts](lib/sections.ts) — `SECTIONS` array: topic → slug → display label → short tag. Drives homepage section order, section sub-page routes, and the per-card meta tag.
- [lib/regions.ts](lib/regions.ts) — `REGIONS` array: slug → display label. Drives the globe dropdown and region sub-page routes. Classifier geography tags must use these slugs verbatim.

### Panic/Hope/Action visual arc (on [`<ArticleCard>`](components/ArticleCard.tsx))

- **Panic**: red 3px left-rule, body weight — the hook. Falls back to `article.description` if the summary is empty.
- **Hope**: italic, muted (`text-white/55`) — counterweight. Hidden if empty.
- **Action**: parsed from the `[text](url)` markdown in the summary. Link present → red CTA button with arrow. No link → italic body text. Uses a real `<a>` with `stopPropagation` on click/mousedown to prevent the outer card click (and the card's drag-to-paywall) from hijacking.

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
- `INVESTIGATIVE_FEEDS` — ProPublica, Intercept, Democracy Now, Grist, Rest of World, Lawfare, Mother Jones
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
- **Client vs server boundary** — components under `components/` use `"use client"`. Server components in `app/` are all under `runtime = "nodejs"` (required — `lib/` uses Node APIs + the OpenAI / Anthropic SDKs).
- **Tailwind v4** — [app/globals.css](app/globals.css) uses `@import "tailwindcss"`. Arbitrary values are fine (`tracking-[-0.02em]`, `grid-rows-[0fr]`). Custom colors/fonts in [tailwind.config.js](tailwind.config.js).
- **Fonts** — Fair Play (big hero wordmark, inline `fontFamily`, falls back to serif) + Libre Baskerville (body/title) + Geist (default sans) + Playfair Display.

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

- **Dynamic ProPublica-style homepage hierarchy** — the current design has a big editorial + uniform sections. The user's vision is a more varied mosaic (big hero + right sidebar, below-fold 3-column layouts, etc.). Needs a layout schema that assigns articles to slots of different sizes. Non-trivial. Screenshots for reference were shown when the user made the request.
- **Intelligent free-use image sourcing for the editorial** — currently uses the top article's OG image. The editorial carries an `imageHint` field from Claude that describes a better editorial image. Integrate with Unsplash or Wikimedia API to pull a matching free-use image, respecting attribution.
- **Article open in iframe/modal** — the user wants clicks to open articles in an embedded frame rather than a new tab, for page retention and future annotations. Most news sites set `X-Frame-Options: DENY` / `frame-ancestors` — needs a graceful-fallback-to-new-tab strategy. Also needs a modal architecture that doesn't break the existing drag-to-paywall flow.
- **Auto-sorting evolution** — ranking currently uses classifier score then date. Future: freshness decay, source authority weighting, cross-topic convergence signals, user-facing dials.
- **Accountability topic** — ProPublica / Intercept / Mother Jones pieces about corruption and regulatory capture often score <5 because they don't cleanly match the current 9 topics. Consider adding an `accountability` classification target.
- **Per-section pagination** — currently all articles for a topic render on the homepage (if there are 10+ in one section, the homepage grows long). The section sub-pages already handle the "show everything" case.
- **Background refresh** — the animated red/orange/black gradient is intentionally kept for now. A flat dark navy would likely read as more editorial. Easy swap in [components/AnimatedBackground.tsx](components/AnimatedBackground.tsx) or replace entirely.
- **OG image rebrand** — [app/layout.tsx](app/layout.tsx) still references `/PTTP2.jpg` as the OG / Twitter card image. Replace with a "Worrry" image when available.

## Gotchas / dead code

- [components/FloatingToDoPanel.jsx](components/FloatingToDoPanel.jsx) is plain JSX, persists to `localStorage`, and is currently not imported anywhere. Dead weight.
- [app/api/route.ts](app/api/route.ts) + [app/api/\[...all\]/](app/api/) — the catchall directory is empty and the top-level route returns 404. Real API route is `/api/cron/ingest`.
- [react-todo-list/](react-todo-list/) is a git submodule — separate vendored project, not part of the Next.js app.
- [path/to/](path/) is an empty placeholder directory from an earlier scaffolding mistake.
- **Historical note**: a `lib/fetchNews.ts` file existed with a hardcoded GNews API key. It was deleted, but the key is still in git history — **rotate the GNews key** at gnews.io if it was ever real.
