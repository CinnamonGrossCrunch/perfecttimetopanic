import { OpenAI } from "openai";

console.log("🔍 ENV DEBUG:");
console.log("KEY:", process.env.OPENAI_API_KEY);
console.log("PROJECT:", process.env.OPENAI_PROJECT_ID);
console.log("ORG:", process.env.OPENAI_ORG_ID);

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
  try {
    const prompt = `You're a poetic analyst who captures global threats with dark insight and glimmers of resilience. For the article below, write a JSON object with three fields:

- "the panic": The core threat or existential concern (a sardonic natural language sentence  comprising 7 words in the explicit format of "Noun(s) verb adverb adjective preposition definite-article(or indefinite-aricle) noun." , with a "well, fuck." tone of voice. )
- "the hope": A sign of resilience, resistance, or redemption (1–2 hopeful lines)
- "the action": Action that a reader can take immediately. always include a clickable hyperlink to a trusted source. (keep short, actionable, and pragmatic) 

Respond ONLY with a valid JSON object. Do not add commentary.

Title: "${title}"
Description: "${description}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a witty, sarcastic, optimistic analyst of societal and global threats, skilled at surfacing the panic, the hope, and the action.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
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
