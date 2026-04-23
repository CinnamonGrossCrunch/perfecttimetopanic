import { OpenAI } from "openai";
import { redisReadCache, redisWriteCache } from "./cacheUtils";
import { urlHash } from "./hash";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1",
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

export type StructuredSummary = {
  "the panic": string;
  "the hope": string;
  "the action": string;
};

const EMPTY: StructuredSummary = { "the panic": "", "the hope": "", "the action": "" };

export async function summarizeWithGPT({
  url,
  title,
  description,
}: {
  url?: string;
  title: string;
  description: string;
}): Promise<StructuredSummary> {
  const cacheKey = url ? `summary:${urlHash(url)}` : null;

  if (cacheKey) {
    const cached = (await redisReadCache(cacheKey)) as StructuredSummary | null;
    if (cached && cached["the panic"]) return cached;
  }

  const prompt = `Your task is to neutrally and accurately summarize the article provided below into a structured JSON object with the following three fields:

- "the panic": Concisely state in 12 words or less the primary concern or issue raised by the author. If the author does not emphasize a significant issue, briefly note the context or question addressed with the appropriate gravity.

- "the hope": Summarize in 12 words or less the author's perspective on optimism, solutions, or positive insights provided. Keep faithful to the author's original tone (cautious, confident, etc.).

- "the action": Recommend, in 12 words or less, a specific, pragmatic action or takeaway mentioned or implied by the author. Include a clickable hyperlink to a relevant, trustworthy source for further reading or action.

Respond ONLY with a valid JSON object in this exact format:
{
  "the panic": "...",
  "the hope": "...",
  "the action": "..."
}

Do not include any commentary, explanation, or markdown.

Title: "${title}"
Description: "${description}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a cynical, analytical assistant tasked with summarizing articles into clear, grudgingly balanced, and contextually accurate structured summaries.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const raw = (response.choices[0].message.content ?? "{}")
      .replace(/^```json|^```|```$/gim, "")
      .trim();

    const parsed = JSON.parse(raw);
    const pick = (...keys: string[]) => {
      for (const k of keys) if (parsed[k]) return parsed[k];
      return "";
    };

    const result: StructuredSummary = {
      "the panic": pick("the panic", "the_panic", "thePanic") || raw,
      "the hope": pick("the hope", "the_hope", "theHope"),
      "the action": pick("the action", "the_action", "theAction"),
    };

    if (cacheKey && result["the panic"]) {
      await redisWriteCache(cacheKey, result);
    }
    return result;
  } catch (err: any) {
    console.error("❌ GPT summarization error:", err.response?.data || err.message || err);
    return { ...EMPTY, "the panic": "⚠️ Summary unavailable due to GPT error." };
  }
}
