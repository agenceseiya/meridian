export type SourceType =
  | "news_api"
  | "gdelt"
  | "rss"
  | "twitter"
  | "telegram"
  | "flight_tracker"
  | "ship_tracker"
  | "government_feed";

export type EventType =
  | "military_movement"
  | "diplomatic"
  | "conflict"
  | "protest"
  | "sanctions"
  | "nuclear"
  | "cyber"
  | "terrorism"
  | "humanitarian"
  | "political"
  | "economic"
  | "maritime"
  | "aviation"
  | "other";

export type Country = "IR" | "US" | "IL" | "OTHER";

export interface NormalizedEvent {
  externalId: string;
  title: string;
  summary?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  eventType?: EventType;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  primaryCountry?: Country;
  countriesInvolved?: string[];
  publishedAt: Date;
  sourceType: SourceType;
  sourceId: string;
  tags?: string[];
  rawData: Record<string, unknown>;
}

export interface IngestionResult {
  sourceId: string;
  sourceName: string;
  eventsFound: number;
  eventsNew: number;
  eventsDuped: number;
  errors: string[];
}

export interface SourceAdapter {
  fetchEvents(): Promise<NormalizedEvent[]>;
}
