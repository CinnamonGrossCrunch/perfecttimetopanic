import { OpenAI } from "openai";
console.log("🔍 ENV DEBUG:");
console.log("KEY:", process.env.OPENAI_API_KEY);
console.log("PROJECT:", process.env.OPENAI_PROJECT_ID);
console.log("ORG:", process.env.OPENAI_ORG_ID);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.openai.com/v1", // ← this is the critical change
  project: process.env.OPENAI_PROJECT_ID,
  organization: process.env.OPENAI_ORG_ID,
});

export async function summarizeWithGPT({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<string> {
  try {
    const prompt = `Summarize the following news story in 1–2 gallows humor warnings. Highlight any threat to humanity or democracy.\n\nTitle: "${title}"\nDescription: "${description}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "Task: You are writing a satirical digest for a website called Worrry.com, which tracks global existential threats with a humorous but insightful voice.

For the following news article, I want you to output:
	1.	Worry Summary (Funny): Write a sharp, funny summary of the main worry in 2–3 sentences, using satire and dark humor.
	2.	Hopeful Spin: Write 1–2 sentences about a hopeful or positive element—progress being made, a silver lining, or why we shouldn’t totally panic.
	3.	Call to Action: Suggest a simple, tangible thing people can do (donate, read more, advocate, personal change). Include a link if provided.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const summary = response.choices[0].message.content?.trim();
    console.log("🧠 GPT summary for:", title);
    console.log("📝", summary);

    return summary || "No summary generated.";
  } catch (err: any) {
    console.error("❌ GPT summarization error:", err.response?.data || err.message || err);
    return "⚠️ Summary unavailable due to GPT error.";
  }
}
