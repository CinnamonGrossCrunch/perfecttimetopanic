import { OpenAI } from "openai";
import { put } from "@vercel/blob";

const EDITORIAL_MODEL = "gpt-4.1";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1",
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

export type Footnote = {
  number: number;
  title: string;
  url: string;
};

export type Editorial = {
  headline: string;
  subhead: string;
  body: string;
  imageHint: string;
  generatedAt: string;
  footnotes: Footnote[];
  sourcedFromArticleUrls: string[];
  audioUrl: string | null;
};

type EditorialInput = {
  url: string;
  title: string;
  description: string;
  topics: string[];
  source: string;
  publishedAt: string;
  panic?: string;
  hope?: string;
};

const SYSTEM_PROMPT = `You are the lead correspondent of a daily threat-intelligence briefing tracking existential and systemic risks to humanity. You receive a ranked batch of the most urgent articles currently surfacing across global news sources. Your job is to write a single long-form current-events briefing — not a philosophical essay, not an anxiety meditation, but a specific, reported, deadline-driven account of what is happening right now and why it matters.

Tone:
- Correspondent, not columnist: ground every claim in a specific event, country, named actor, or data point from the source articles
- Urgent through specificity: convey stakes with numbers, names, and places — not adjectives
- Humane: name the populations affected, name the concrete consequences for real people
- Non-partisan: identify actors by name and role, not by political tribe
- Direct: the reader is an adult capable of processing hard information and taking action

Structure (follow this sequence, minimum 1,200 words total):

1. LEDE — 1 paragraph, ~120 words
Open on the single most acute event in today's feed. The specific incident. The specific number. The specific place. No "at a time when" constructions. No throat-clearing. Start with the thing that is happening.

2. THREAT THREADS — 3 to 4 paragraphs, ~200 words each
Walk through the distinct major threat categories represented in today's articles. Each paragraph covers one domain (e.g. democratic backsliding, climate tipping points, AI governance failures, nuclear escalation, biosecurity gaps, economic contagion, civil liberties erosion). Ground each in specific reporting from the articles: what happened, where, who did it, what the documented consequences are. Use source names and publication dates where available.

3. CONVERGENCE — 1 paragraph, ~150 words
Show how two or more threat threads intersect or amplify each other. This is the connective tissue — the point at which the individual stories become a single pattern. Be specific about the mechanism of convergence, not just the thematic similarity.

4. TRAJECTORY — 1 paragraph, ~130 words
Name what the next 30 to 90 days look like if the current trajectory holds. Be specific: name the votes, court decisions, treaty deadlines, deployment timelines, or seasonal thresholds that will determine the outcome. Do not resolve. Do not offer comfort. Do not call for action. End on the open fact, not the closed argument.

Requirements:
- Minimum body length: 1,200 words. Do not truncate. Write to completion.
- Only use events and data points present in the articles provided. Do not invent.
- Every claim must be traceable to a named actor, place, date, or number from the source material.
- Paragraphs must have forward momentum — each one should move the reader closer to understanding the full picture.

Avoid:
- Both-sidesism
- Generic calls to "donate / vote / share"
- Clichés: canary in the coal mine, powder keg, ticking clock, perfect storm, wake-up call, at a crossroads, unprecedented, inflection point
- Self-reference: do not mention "this editorial", "Worrry", "this briefing", or the act of synthesis
- Vague abstractions without a specific anchor
- Passive voice as evasion ("mistakes were made", "tensions have risen")

headline: 12 words or fewer. Declarative. The one fact the reader must not miss today.
subhead: 25 words or fewer. One sentence. Why this, why now.
Citations: when you reference a specific fact, event, or data point drawn from one of the source articles, place a numeric marker inline in the text: [1], [2], etc. Do not cite every sentence — only anchor claims that are specific and verifiable. Aim for 6-14 citations across the piece. Each marker must correspond to an entry in the footnotes array.

footnotes: an array of objects, one per citation marker used in the body. Each object: { number (integer matching the inline marker), title (the article headline, under 100 characters), url (the article URL) }. Order by number ascending.
sourcedFromArticleUrls: flat array of the same URLs for backward compatibility.
imageHint: 3-8 words describing a real photographic scene that could illustrate the piece. Not a stock-photo cliché or metaphor — a specific, documentable scene. Example: "rescue workers sorting rubble, dust still rising".`;

const EDITORIAL_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    subhead: { type: "string" },
    body: { type: "string" },
    imageHint: { type: "string" },
    footnotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "integer" },
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["number", "title", "url"],
        additionalProperties: false,
      },
    },
    sourcedFromArticleUrls: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["headline", "subhead", "body", "imageHint", "footnotes", "sourcedFromArticleUrls"],
  additionalProperties: false,
} as const;

function buildUserPrompt(articles: EditorialInput[]): string {
  const numbered = articles
    .map((a, i) => {
      const topics = a.topics.length ? ` [${a.topics.join(", ")}]` : "";
      const meta = [a.source, a.publishedAt ? a.publishedAt.slice(0, 10) : ""].filter(Boolean).join(" · ");
      const desc = (a.description || "").slice(0, 500);
      const panic = a.panic ? `\n    THREAT: ${a.panic}` : "";
      const hope = a.hope ? `\n    CONTEXT: ${a.hope}` : "";
      return `[${i + 1}] ${a.title}${topics}\n    source: ${meta}\n    url: ${a.url}\n    summary: ${desc}${panic}${hope}`;
    })
    .join("\n\n");

  return `Here are today's top articles ranked by threat relevance. Write a 1,200+ word current-events threat briefing grounded in the specific reporting below. Name events, places, actors, and data points. Do not generalize. Do not philosophize. Report what is happening.

${numbered}`;
}

/**
 * Generate the flagship editorial. Returns null if the API call fails — the
 * homepage gracefully omits the editorial card in that case.
 */
export async function generateEditorial(articles: EditorialInput[]): Promise<Editorial | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("[editorial] OPENAI_API_KEY not set — skipping editorial generation");
    return null;
  }

  if (articles.length === 0) {
    console.log("[editorial] no articles — skipping");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: EDITORIAL_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(articles) },
      ],
      temperature: 0.6,
      // 1,200-word body ≈ 1,800 tokens + headline/subhead/meta overhead + margin
      max_tokens: 5000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "worrry_editorial",
          strict: true,
          schema: EDITORIAL_SCHEMA,
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      console.error("[editorial] empty response");
      return null;
    }

    const parsed = JSON.parse(raw) as Omit<Editorial, "generatedAt" | "audioUrl">;

    console.log(
      `[editorial] generated via ${EDITORIAL_MODEL} ` +
        `(${response.usage?.prompt_tokens ?? "?"} in, ${response.usage?.completion_tokens ?? "?"} out)`
    );

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
      audioUrl: null,
    };
  } catch (err: any) {
    console.error("[editorial] generation failed:", err?.message ?? err);
    return null;
  }
}

function stripCitationsForAudio(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Generate a TTS mp3 for the editorial and upload to Vercel Blob.
 * Returns the public URL, or null if TTS or Blob is not configured.
 */
export async function generateEditorialAudio(editorial: Editorial): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY || !process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("[editorial-audio] missing API key or Blob token — skipping");
    return null;
  }

  const script = `${stripCitationsForAudio(editorial.headline)}.\n\n${stripCitationsForAudio(editorial.body)}`;
  const truncated = script.length > 4096 ? script.slice(0, 4093) + "…" : script;

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "fable",
      input: truncated,
      speed: 1.15,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filename = `editorial-${editorial.generatedAt.slice(0, 10)}.mp3`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
    });

    console.log(`[editorial-audio] uploaded to Blob: ${blob.url}`);
    return blob.url;
  } catch (err: any) {
    console.error("[editorial-audio] failed:", err?.message ?? err);
    return null;
  }
}
