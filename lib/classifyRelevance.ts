import { OpenAI } from "openai";
import { redisReadCache, redisWriteCache } from "./cacheUtils";
import { urlHash } from "./hash";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1",
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

export type Relevance = {
  score: number;
  topics: string[];
  geographies: string[];
};

export const TOPICS = [
  "climate",
  "ai-risk",
  "authoritarianism",
  "pandemic",
  "war-nuclear",
  "economic-collapse",
  "disinformation",
  "civil-rights",
  "surveillance",
] as const;

export const GEOGRAPHIES = [
  "north-america",
  "south-america",
  "europe",
  "africa",
  "middle-east",
  "asia",
  "oceania",
  "global",
] as const;

const SYSTEM = `You score news articles for a curated feed about societal threats.

Topics of interest (an article can match multiple):
- climate: climate change, environmental collapse, biodiversity, pollution
- ai-risk: AI safety, algorithmic harm, automation displacement, model abuse
- authoritarianism: democratic erosion, coups, strongman politics, press suppression, corporate/institutional capture of democratic processes
- pandemic: disease outbreaks, biosecurity, public health crises
- war-nuclear: armed conflict, nuclear risk, geopolitical escalation
- economic-collapse: systemic financial risk, extreme inequality, debt crisis, regulatory capture
- disinformation: media manipulation, propaganda, deepfakes, information warfare
- civil-rights: human rights violations, discrimination, persecution, suppression of dissent
- surveillance: state/corporate surveillance, privacy erosion, biometric tracking

Geographies are where the threat/events described are HAPPENING (not where the outlet or author is based):
- north-america, south-america, europe, africa, middle-east, asia, oceania
- global: transnational threats (climate, AI, pandemics) or stories that span multiple continents

Score each article 0-10 for overall relevance to the feed:
- 0-3 = unrelated (sports, entertainment, lifestyle, markets fluff, celebrity, cooking, product reviews)
- 4-5 = adjacent but not the focus
- 6-7 = relevant, covers a threat topic
- 8-10 = central and substantive on a threat topic

List ALL applicable topics (usually 1-3). List ALL applicable geographies (usually 1-3, or just ["global"] for transnational). If nothing applies, return empty arrays and a low score.`;

type ClassifyInput = {
  url: string;
  title: string;
  description: string;
};

async function classifyBatch(items: ClassifyInput[]): Promise<Relevance[]> {
  if (items.length === 0) return [];

  const numbered = items
    .map((a, i) => `[${i}] title: ${a.title}\n    desc: ${(a.description || "").slice(0, 400)}`)
    .join("\n\n");

  const user = `Classify these ${items.length} articles. Respond with JSON:
{ "results": [ { "i": <index>, "score": <0-10>, "topics": [<tag>, ...], "geographies": [<region>, ...] }, ... ] }

Articles:
${numbered}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 0,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    const results = Array.isArray(parsed.results) ? parsed.results : [];

    const out: Relevance[] = items.map(() => ({ score: 0, topics: [], geographies: [] }));
    const validTopics = new Set<string>(TOPICS);
    const validGeos = new Set<string>(GEOGRAPHIES);

    for (const r of results) {
      const i = typeof r.i === "number" ? r.i : -1;
      if (i < 0 || i >= items.length) continue;
      const topics = Array.isArray(r.topics)
        ? r.topics.filter((t: unknown): t is string => typeof t === "string" && validTopics.has(t))
        : [];
      const geographies = Array.isArray(r.geographies)
        ? r.geographies.filter(
            (g: unknown): g is string => typeof g === "string" && validGeos.has(g)
          )
        : [];
      out[i] = {
        score: Math.max(0, Math.min(10, Number(r.score) || 0)),
        topics,
        geographies,
      };
    }
    return out;
  } catch (err: any) {
    console.error("❌ Classifier error:", err.message || err);
    return items.map(() => ({ score: 0, topics: [], geographies: [] }));
  }
}

/**
 * Classify articles for relevance. Per-URL cache under `relevance-v2:<hash>`.
 * (The v2 prefix skips entries from the earlier single-topic classifier shape.)
 */
export async function classifyRelevance(items: ClassifyInput[]): Promise<Relevance[]> {
  const out: Relevance[] = new Array(items.length);
  const toClassify: { idx: number; input: ClassifyInput }[] = [];

  for (let i = 0; i < items.length; i++) {
    const key = `relevance-v2:${urlHash(items[i].url)}`;
    const cached = (await redisReadCache(key)) as Relevance | null;
    if (cached && typeof cached.score === "number" && Array.isArray(cached.topics)) {
      out[i] = {
        score: cached.score,
        topics: cached.topics,
        geographies: Array.isArray(cached.geographies) ? cached.geographies : [],
      };
    } else {
      toClassify.push({ idx: i, input: items[i] });
    }
  }

  const BATCH = 15;
  for (let b = 0; b < toClassify.length; b += BATCH) {
    const slice = toClassify.slice(b, b + BATCH);
    const results = await classifyBatch(slice.map((s) => s.input));
    for (let j = 0; j < slice.length; j++) {
      const { idx, input } = slice[j];
      const rel = results[j] ?? { score: 0, topics: [], geographies: [] };
      out[idx] = rel;
      await redisWriteCache(`relevance-v2:${urlHash(input.url)}`, rel);
    }
  }

  return out;
}
