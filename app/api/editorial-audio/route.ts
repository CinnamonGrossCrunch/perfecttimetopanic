export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// Strip citation markers like [1], [2] so they aren't read aloud
function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  let headline: string;
  let body: string;
  try {
    ({ headline, body } = await req.json());
    if (!headline || !body) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  // Compose the script: headline read as a title, then the body with citations stripped
  const script = `${stripCitations(headline)}.\n\n${stripCitations(body)}`;

  // OpenAI TTS supports up to 4096 characters — truncate gracefully if needed
  const truncated = script.length > 4096 ? script.slice(0, 4093) + "…" : script;

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: truncated,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.byteLength),
        // Cache for 2 hours — matches feed refresh cadence
        "Cache-Control": "public, max-age=7200, s-maxage=7200",
      },
    });
  } catch (err: any) {
    console.error("[editorial-audio] TTS failed:", err?.message ?? err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
