import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================
// ENUMS
// ============================================================

export const sourceTypeEnum = pgEnum("source_type", [
  "news_api",
  "gdelt",
  "rss",
  "twitter",
  "telegram",
  "flight_tracker",
  "ship_tracker",
  "government_feed",
]);

export const threatLevelEnum = pgEnum("threat_level", [
  "1",
  "2",
  "3",
  "4",
  "5",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "military_movement",
  "diplomatic",
  "conflict",
  "protest",
  "sanctions",
  "nuclear",
  "cyber",
  "terrorism",
  "humanitarian",
  "political",
  "economic",
  "maritime",
  "aviation",
  "other",
]);

export const countryEnum = pgEnum("country", ["IR", "US", "IL", "OTHER"]);

export const briefTypeEnum = pgEnum("brief_type", [
  "daily",
  "breaking",
  "weekly",
  "ad_hoc",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
  "flash",
]);

// ============================================================
// TABLES
// ============================================================

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: sourceTypeEnum("type").notNull(),
  url: text("url"),
  config: jsonb("config"),
  isActive: boolean("is_active").default(true).notNull(),
  fetchIntervalSeconds: integer("fetch_interval_seconds").default(300),
  lastFetchAt: timestamp("last_fetch_at", { withTimezone: true }),
  lastStatus: text("last_status"),
  lastError: text("last_error"),
  eventCount: integer("event_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id").references(() => sources.id),
    externalId: text("external_id"),
    contentHash: text("content_hash"),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content"),
    url: text("url"),
    imageUrl: text("image_url"),

    // Classification
    eventType: eventTypeEnum("event_type"),
    threatLevel: threatLevelEnum("threat_level"),
    aiClassification: jsonb("ai_classification"),
    isVerified: boolean("is_verified").default(false),

    // Geography
    latitude: real("latitude"),
    longitude: real("longitude"),
    locationName: text("location_name"),
    primaryCountry: countryEnum("primary_country"),
    countriesInvolved: text("countries_involved").array(),
    region: text("region"),

    // Metadata
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    classifiedAt: timestamp("classified_at", { withTimezone: true }),
    sourceType: sourceTypeEnum("source_type"),
    rawData: jsonb("raw_data"),
    tags: text("tags").array(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_events_content_hash").on(table.contentHash),
    index("idx_events_published_at").on(table.publishedAt),
    index("idx_events_threat_level").on(table.threatLevel),
    index("idx_events_event_type").on(table.eventType),
    index("idx_events_primary_country").on(table.primaryCountry),
    index("idx_events_source_type").on(table.sourceType),
    index("idx_events_geo").on(table.latitude, table.longitude),
  ]
);

export const intelligenceBriefs = pgTable("intelligence_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: briefTypeEnum("type").notNull(),
  title: text("title").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  fullContent: text("full_content").notNull(),
  keyFindings: jsonb("key_findings"),
  threatAssessment: jsonb("threat_assessment"),
  eventIds: uuid("event_ids").array(),
  modelUsed: text("model_used"),
  promptTokens: integer("prompt_tokens"),
  outputTokens: integer("output_tokens"),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  severity: alertSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventId: uuid("event_id").references(() => events.id),
  briefId: uuid("brief_id").references(() => intelligenceBriefs.id),
  triggerReason: text("trigger_reason"),
  isActive: boolean("is_active").default(true).notNull(),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ingestionLogs = pgTable("ingestion_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id").references(() => sources.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  status: text("status").notNull(),
  eventsFound: integer("events_found").default(0),
  eventsNew: integer("events_new").default(0),
  eventsDuped: integer("events_duped").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type IntelligenceBrief = typeof intelligenceBriefs.$inferSelect;
export type NewIntelligenceBrief = typeof intelligenceBriefs.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type NewIngestionLog = typeof ingestionLogs.$inferInsert;
