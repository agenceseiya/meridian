import { db } from "@/lib/db";
import { events, ingestionLogs } from "@/lib/db/schema";
import { computeHash, deduplicateEvents } from "./deduplicator";
import { extractLocation, detectCountries } from "@/lib/utils/geo";
import type { NormalizedEvent, IngestionResult } from "./types";

export async function ingestEvents(
  incoming: NormalizedEvent[],
  sourceId: string,
  sourceName: string
): Promise<IngestionResult> {
  const result: IngestionResult = {
    sourceId,
    sourceName,
    eventsFound: incoming.length,
    eventsNew: 0,
    eventsDuped: 0,
    errors: [],
  };

  const logEntry = await db
    .insert(ingestionLogs)
    .values({
      sourceId,
      startedAt: new Date(),
      status: "running",
      eventsFound: incoming.length,
    })
    .returning({ id: ingestionLogs.id });

  const logId = logEntry[0]?.id;

  try {
    // Deduplicate
    const newEvents = await deduplicateEvents(incoming);
    result.eventsNew = newEvents.length;
    result.eventsDuped = incoming.length - newEvents.length;

    if (newEvents.length === 0) {
      if (logId) {
        await db
          .update(ingestionLogs)
          .set({
            completedAt: new Date(),
            status: "success",
            eventsNew: 0,
            eventsDuped: result.eventsDuped,
          })
          .where(eq(ingestionLogs.id, logId));
      }
      return result;
    }

    // Enrich with geolocation and country detection
    const enriched = newEvents.map((event) => {
      const text = `${event.title} ${event.summary || ""} ${event.content || ""}`;
      const geo = event.latitude ? null : extractLocation(text);
      const countries =
        event.countriesInvolved && event.countriesInvolved.length > 0
          ? event.countriesInvolved
          : detectCountries(text);

      return {
        sourceId: event.sourceId,
        externalId: event.externalId,
        contentHash: computeHash(event),
        title: event.title,
        summary: event.summary,
        content: event.content,
        url: event.url,
        imageUrl: event.imageUrl,
        eventType: event.eventType,
        latitude: event.latitude ?? geo?.latitude,
        longitude: event.longitude ?? geo?.longitude,
        locationName: event.locationName ?? geo?.locationName,
        primaryCountry:
          event.primaryCountry ?? geo?.country ?? (countries[0] as "IR" | "US" | "IL" | "OTHER"),
        countriesInvolved: countries as string[],
        region: "Middle East",
        publishedAt: event.publishedAt,
        sourceType: event.sourceType,
        rawData: event.rawData,
        tags: event.tags,
      };
    });

    // Batch insert
    await db.insert(events).values(enriched);

    // Update ingestion log
    if (logId) {
      await db
        .update(ingestionLogs)
        .set({
          completedAt: new Date(),
          status: "success",
          eventsNew: result.eventsNew,
          eventsDuped: result.eventsDuped,
        })
        .where(eq(ingestionLogs.id, logId));
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(message);

    if (logId) {
      await db
        .update(ingestionLogs)
        .set({
          completedAt: new Date(),
          status: "error",
          errorMessage: message,
        })
        .where(eq(ingestionLogs.id, logId));
    }
  }

  return result;
}

// We need eq for the update queries
import { eq } from "drizzle-orm";
