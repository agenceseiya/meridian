export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryEvents, getEventStats } from "@/lib/db/queries/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // If requesting stats
  if (searchParams.get("stats") === "true") {
    const stats = await getEventStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
      },
    });
  }

  const params = {
    page: Number(searchParams.get("page")) || 1,
    limit: Math.min(Number(searchParams.get("limit")) || 50, 100),
    threatLevel: searchParams.get("threatLevel") || undefined,
    eventType: searchParams.get("eventType") || undefined,
    country: searchParams.get("country") || undefined,
    sourceType: searchParams.get("sourceType") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  };

  const result = await queryEvents(params);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
    },
  });
}
