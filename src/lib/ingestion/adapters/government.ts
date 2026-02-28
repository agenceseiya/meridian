import { fetchRSSFeed } from "./rss";
import type { NormalizedEvent } from "../types";

const GOV_FEEDS = [
  {
    name: "US State Department",
    url: "https://www.state.gov/rss-feed/press-releases/feed/",
  },
  {
    name: "US DoD News",
    url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1",
  },
  {
    name: "IRNA English",
    url: "https://en.irna.ir/rss",
  },
];

export async function fetchGovernmentFeeds(
  sourceId: string
): Promise<NormalizedEvent[]> {
  const allEvents: NormalizedEvent[] = [];

  for (const feed of GOV_FEEDS) {
    try {
      const events = await fetchRSSFeed({
        sourceId,
        feedUrl: feed.url,
        sourceType: "government_feed",
      });
      allEvents.push(...events);
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
    }
  }

  return allEvents;
}
