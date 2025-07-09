import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API request path:", req.url);
  return new NextResponse("Not found", { status: 404 });
}

export async function POST(req: NextRequest) {
  console.log("API request path:", req.url);
  return new NextResponse("Not found", { status: 404 });
}