export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchGovernmentFeeds } from "@/lib/ingestion/adapters/government";
import { ingestEvents } from "@/lib/ingestion/normalizer";
import { upsertSource, updateSourceStatus } from "@/lib/db/queries/sources";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const source = await upsertSource({
      name: "Government Feeds",
      type: "government_feed",
    });

    const events = await fetchGovernmentFeeds(source.id);
    const result = await ingestEvents(events, source.id, "Government Feeds");

    await updateSourceStatus(source.id, "ok");

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Government feeds ingestion failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
