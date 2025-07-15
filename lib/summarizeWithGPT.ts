import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1",
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

type StructuredSummary = {
  "the panic": string;
  "the hope": string;
  "the action": string;
};

export async function summarizeWithGPT({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<StructuredSummary> {
  const prompt = `Your task is to neutrally and accurately summarize the article provided below into a structured JSON object with the following three fields:

- "the panic": Concisely state in 12 words or less the primary concern or issue raised by the author. If the author does not emphasize a significant issue, briefly note the context or question addressed with the appropriate gravity.

- "the hope": Summarize in 12 words or lessthe author's perspective on optimism, solutions, or positive insights provided. Keep faithful to the author's original tone (cautious, confident, etc.).

- "the action": Recommend, in 12 words or less,  a specific, pragmatic action or takeaway mentioned or implied by the author. Include a clickable hyperlink to a relevant, trustworthy source for further reading or action.

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
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 700,
    });

    let raw = response.choices[0].message.content?.trim() ?? "{}";
    raw = raw.replace(/^```json|^```|```$/gim, "").trim();

    function extractField(obj: any, ...keys: string[]) {
      for (const key of keys) {
        if (obj[key]) return obj[key];
      }
      return "";
    }

    try {
      const parsed = JSON.parse(raw);
      const thePanic = extractField(parsed, "the panic", "the_panic", "thePanic");
      const theHope = extractField(parsed, "the hope", "the_hope", "theHope");
      const theAction = extractField(parsed, "the action", "the_action", "theAction");

      if (thePanic && theHope && theAction) {
        console.log("🧠 GPT structured summary for:", title);
        console.log("📝", parsed);
        return {
          "the panic": thePanic,
          "the hope": theHope,
          "the action": theAction,
        };
      } else {
        throw new Error("Incomplete fields");
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse GPT JSON for:", title);
      console.warn("↪️ Fallback content:", raw);
      return {
        "the panic": raw,
        "the hope": "",
        "the action": "",
      };
    }
  } catch (err: any) {
    console.error("❌ GPT summarization error:", err.response?.data || err.message || err);
    return {
      "the panic": "⚠️ Summary unavailable due to GPT error.",
      "the hope": "",
      "the action": "",
    };
  }
}
