import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeWithGPT({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<string> {
  try {
    const prompt = `Summarize the following news story in 1-2 ominous, insightful sentences. Highlight any existential threat to humanity or democracy.\n\nTitle: "${title}"\nDescription: "${description}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 100,
    });

    return response.choices[0].message.content?.trim() ?? "No summary generated.";
  } catch (err) {
    console.error("❌ GPT summarization failed:", err);
    return "Summary unavailable.";
  }
}

