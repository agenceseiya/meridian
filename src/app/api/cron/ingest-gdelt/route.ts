export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchGDELTArticles, fetchGDELTGeo } from "@/lib/ingestion/adapters/gdelt";
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
      name: "GDELT",
      type: "gdelt",
      url: "https://api.gdeltproject.org",
    });

    // Fetch from both DOC and GEO APIs
    const [articles, geoEvents] = await Promise.all([
      fetchGDELTArticles(source.id),
      fetchGDELTGeo(source.id),
    ]);

    const allEvents = [...articles, ...geoEvents];
    const result = await ingestEvents(allEvents, source.id, "GDELT");

    await updateSourceStatus(source.id, "ok");

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GDELT ingestion failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
