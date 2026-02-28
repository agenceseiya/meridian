import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import {
  desc,
  eq,
  and,
  gte,
  lte,
  sql,
  ilike,
  between,
} from "drizzle-orm";

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  threatLevel?: string;
  eventType?: string;
  country?: string;
  sourceType?: string;
  from?: string;
  to?: string;
}

export async function queryEvents(params: EventsQueryParams = {}) {
  const {
    page = 1,
    limit = 50,
    threatLevel,
    eventType,
    country,
    sourceType,
    from,
    to,
  } = params;

  const conditions = [];

  if (threatLevel) {
    conditions.push(eq(events.threatLevel, threatLevel as "1" | "2" | "3" | "4" | "5"));
  }
  if (eventType) {
    conditions.push(eq(events.eventType, eventType as typeof events.eventType.enumValues[number]));
  }
  if (country) {
    conditions.push(eq(events.primaryCountry, country as "IR" | "US" | "IL" | "OTHER"));
  }
  if (sourceType) {
    conditions.push(eq(events.sourceType, sourceType as typeof events.sourceType.enumValues[number]));
  }
  if (from) {
    conditions.push(gte(events.publishedAt, new Date(from)));
  }
  if (to) {
    conditions.push(lte(events.publishedAt, new Date(to)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(events)
      .where(where)
      .orderBy(desc(events.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(where),
  ]);

  return {
    events: data,
    total: Number(countResult[0]?.count || 0),
    page,
    limit,
    totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  };
}

export async function queryMapEvents(params: {
  hours?: number;
  threatLevel?: string;
  eventType?: string;
}) {
  const { hours = 24, threatLevel, eventType } = params;

  const conditions = [
    gte(events.publishedAt, new Date(Date.now() - hours * 60 * 60 * 1000)),
    sql`${events.latitude} IS NOT NULL`,
    sql`${events.longitude} IS NOT NULL`,
  ];

  if (threatLevel) {
    conditions.push(eq(events.threatLevel, threatLevel as "1" | "2" | "3" | "4" | "5"));
  }
  if (eventType) {
    conditions.push(eq(events.eventType, eventType as typeof events.eventType.enumValues[number]));
  }

  return db
    .select({
      id: events.id,
      title: events.title,
      summary: events.summary,
      latitude: events.latitude,
      longitude: events.longitude,
      locationName: events.locationName,
      eventType: events.eventType,
      threatLevel: events.threatLevel,
      primaryCountry: events.primaryCountry,
      sourceType: events.sourceType,
      publishedAt: events.publishedAt,
      url: events.url,
    })
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.publishedAt))
    .limit(500);
}

export async function searchEvents(query: string, page = 1, limit = 20) {
  const results = await db
    .select()
    .from(events)
    .where(
      sql`to_tsvector('english', coalesce(${events.title}, '') || ' ' || coalesce(${events.summary}, '') || ' ' || coalesce(${events.content}, '')) @@ plainto_tsquery('english', ${query})`
    )
    .orderBy(desc(events.publishedAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return results;
}

export async function getEventById(id: string) {
  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getEventStats() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalResult, recentResult, threatCounts] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(events),
    db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(gte(events.publishedAt, twentyFourHoursAgo)),
    db
      .select({
        threatLevel: events.threatLevel,
        count: sql<number>`count(*)`,
      })
      .from(events)
      .where(gte(events.publishedAt, twentyFourHoursAgo))
      .groupBy(events.threatLevel),
  ]);

  return {
    total: Number(totalResult[0]?.count || 0),
    last24h: Number(recentResult[0]?.count || 0),
    byThreatLevel: Object.fromEntries(
      threatCounts.map((r) => [r.threatLevel || "unclassified", Number(r.count)])
    ),
  };
}
