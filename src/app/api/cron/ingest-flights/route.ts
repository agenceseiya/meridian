export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchOpenSky } from "@/lib/ingestion/adapters/opensky";
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
      name: "OpenSky Network",
      type: "flight_tracker",
      url: "https://opensky-network.org",
    });

    const events = await fetchOpenSky(source.id);
    const result = await ingestEvents(events, source.id, "OpenSky Network");

    await updateSourceStatus(source.id, "ok");

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OpenSky ingestion failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
