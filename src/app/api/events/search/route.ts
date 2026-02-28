export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/lib/db/queries/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const events = await searchEvents(query, page, limit);

  return NextResponse.json({ events, query, page, limit });
}
