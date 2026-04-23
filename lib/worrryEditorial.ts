import { OpenAI } from "openai";

// Using OpenAI gpt-4.1 for the editorial authoring while ANTHROPIC_API_KEY is not
// configured. gpt-4.1 is top-tier for non-reasoning writing tasks and well-suited
// for nuanced synthesis. To switch back to Claude Opus 4.7, see CLAUDE.md.
const EDITORIAL_MODEL = "gpt-4.1";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1",
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

export type Editorial = {
  headline: string;
  subhead: string;
  body: string;
  imageHint: string;
  generatedAt: string;
  sourcedFromArticleUrls: string[];
};

type EditorialInput = {
  url: string;
  title: string;
  description: string;
  topics: string[];
  panic?: string;
};

const SYSTEM_PROMPT = `You are the synthesis voice of a news aggregator tracking existential-level threats to humanity. Your job is to read a batch of recent articles and compose one short editorial piece that surfaces the most urgent, convergent pattern across them.

Tone:
- Hair on fire: convey the stakes without decoration
- Humane: name people, name places, name what is at stake for human beings
- Defiant: this is not doomerism — presume the reader is an adult who will act
- Non-partisan: name actors by role (a head of state, a regulator, a CEO), not by political tribe
- Broad: focus on threats to humanity at large — war, genocide, disease, concrete AI harms, climate tipping points, nuclear risk, collapse of democratic institutions. Skip narrow-interest outrage, single-country domestic politics, cultural-war sideshows.

Structure:
- headline: 12 words or fewer. Declarative. The one thing the reader should not look away from today.
- subhead: 25 words or fewer, one sentence. Why this, why now.
- body: 450-650 words, 3-4 tight paragraphs separated by blank lines. Open with the specific and visible — the smoke, the bodies, the data point. Widen to the pattern. Name what comes next if attention does not arrive. Do not moralize. Do not resolve neatly. Do not end with a call-to-action boilerplate.

Avoid:
- Both-sidesism
- Generic calls to "donate / vote / share"
- Cliches (canary in the coal mine, powder keg, ticking clock, perfect storm, wake-up call)
- Self-reference (do not mention "this editorial", "we", "Worrry", "this feed", or the act of synthesis)

imageHint: 3-8 words describing an appropriate photographic subject that could illustrate the piece without dressing the tragedy up. Example: "smoke over a destroyed residential block". Not a stock-photo cliche.

sourcedFromArticleUrls: the URLs (from the input) of the articles you actually drew the synthesis from. Usually 2-5. Omit articles you did not use.`;

const EDITORIAL_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string" },
    subhead: { type: "string" },
    body: { type: "string" },
    imageHint: { type: "string" },
    sourcedFromArticleUrls: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["headline", "subhead", "body", "imageHint", "sourcedFromArticleUrls"],
  additionalProperties: false,
} as const;

function buildUserPrompt(articles: EditorialInput[]): string {
  const numbered = articles
    .map((a, i) => {
      const topics = a.topics.length ? ` [${a.topics.join(", ")}]` : "";
      const panic = a.panic ? `\n    panic: ${a.panic}` : "";
      const desc = (a.description || "").slice(0, 400);
      return `[${i}] ${a.title}${topics}\n    url: ${a.url}\n    desc: ${desc}${panic}`;
    })
    .join("\n\n");

  return `Here are the top articles currently surfacing across the feed. Synthesize the single most urgent, convergent pattern — the thread the reader cannot afford to miss. One piece.

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
      temperature: 0.7,
      // Enough room for body (~850 tokens) + headline/subhead/imageHint/urls with margin.
      max_tokens: 2500,
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

    const parsed = JSON.parse(raw) as Omit<Editorial, "generatedAt">;

    console.log(
      `[editorial] generated via ${EDITORIAL_MODEL} ` +
        `(${response.usage?.prompt_tokens ?? "?"} in, ${response.usage?.completion_tokens ?? "?"} out)`
    );

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error("[editorial] generation failed:", err?.message ?? err);
    return null;
  }
}
