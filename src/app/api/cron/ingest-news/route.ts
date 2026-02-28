export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { fetchRSSFeed } from "@/lib/ingestion/adapters/rss";
import { fetchNewsAPI } from "@/lib/ingestion/adapters/newsapi";
import { ingestEvents } from "@/lib/ingestion/normalizer";
import { upsertSource, updateSourceStatus } from "@/lib/db/queries/sources";
import { RSS_FEEDS } from "@/lib/utils/constants";
import type { NormalizedEvent } from "@/lib/ingestion/types";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  // Ingest RSS feeds
  for (const feed of RSS_FEEDS) {
    try {
      const source = await upsertSource({
        name: feed.name,
        type: feed.type,
        url: feed.url,
      });

      const events = await fetchRSSFeed({
        sourceId: source.id,
        feedUrl: feed.url,
        sourceType: feed.type,
      });

      const result = await ingestEvents(events, source.id, feed.name);
      await updateSourceStatus(source.id, "ok");
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`RSS ingestion failed for ${feed.name}:`, message);
      results.push({
        sourceId: "",
        sourceName: feed.name,
        eventsFound: 0,
        eventsNew: 0,
        eventsDuped: 0,
        errors: [message],
      });
    }
  }

  // Ingest NewsAPI (if key configured)
  if (process.env.NEWSAPI_ORG_KEY) {
    try {
      const source = await upsertSource({
        name: "NewsAPI.org",
        type: "news_api",
        url: "https://newsapi.org",
      });

      const events = await fetchNewsAPI(source.id);
      const result = await ingestEvents(events, source.id, "NewsAPI.org");
      await updateSourceStatus(source.id, "ok");
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("NewsAPI ingestion failed:", message);
      results.push({
        sourceId: "",
        sourceName: "NewsAPI.org",
        eventsFound: 0,
        eventsNew: 0,
        eventsDuped: 0,
        errors: [message],
      });
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.eventsNew, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  return NextResponse.json({
    sources: results.length,
    totalNew,
    totalErrors,
    results,
  });
}
