import { NextRequest, NextResponse } from "next/server";
import { buildFeed } from "../../../../lib/buildFeed";

export const runtime = "nodejs";
// Vercel's max hobby function duration. The build can take a minute or two.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Vercel Cron calls with `Authorization: Bearer ${CRON_SECRET}`. In dev, allow
  // unauthenticated hits so you can manually trigger via curl.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  try {
    const feed = await buildFeed();
    return NextResponse.json({
      ok: true,
      generatedAt: feed.generatedAt,
      articles: feed.articles.length,
    });
  } catch (err: any) {
    console.error("[cron/ingest] failed:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
