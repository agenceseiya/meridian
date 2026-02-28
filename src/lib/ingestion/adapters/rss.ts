import Parser from "rss-parser";
import type { NormalizedEvent, SourceType } from "../types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "MERIDIAN-OSINT/1.0",
  },
});

interface RSSAdapterConfig {
  sourceId: string;
  feedUrl: string;
  sourceType: SourceType;
}

export async function fetchRSSFeed(
  config: RSSAdapterConfig
): Promise<NormalizedEvent[]> {
  const feed = await parser.parseURL(config.feedUrl);
  const events: NormalizedEvent[] = [];

  for (const item of feed.items) {
    if (!item.title) continue;

    // Filter for relevance - must mention Iran, Israel, US/Middle East
    const text =
      `${item.title} ${item.contentSnippet || ""} ${item.content || ""}`.toLowerCase();
    const isRelevant =
      text.includes("iran") ||
      text.includes("israel") ||
      text.includes("idf") ||
      text.includes("irgc") ||
      text.includes("hezbollah") ||
      text.includes("hamas") ||
      text.includes("middle east") ||
      text.includes("persian gulf") ||
      text.includes("strait of hormuz") ||
      text.includes("nuclear") ||
      text.includes("tehran") ||
      text.includes("netanyahu") ||
      text.includes("khamenei") ||
      text.includes("centcom") ||
      text.includes("red sea") ||
      text.includes("houthi");

    if (!isRelevant) continue;

    events.push({
      externalId: item.guid || item.link || item.title,
      title: item.title,
      summary: item.contentSnippet?.slice(0, 500),
      content: item.content?.slice(0, 5000),
      url: item.link,
      imageUrl: item.enclosure?.url,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      sourceType: config.sourceType,
      sourceId: config.sourceId,
      tags: item.categories?.slice(0, 10),
      rawData: {
        creator: item.creator,
        categories: item.categories,
        isoDate: item.isoDate,
      },
    });
  }

  return events;
}
