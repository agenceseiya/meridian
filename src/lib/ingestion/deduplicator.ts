import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { contentHash } from "@/lib/utils/hash";
import type { NormalizedEvent } from "./types";

export async function deduplicateEvents(
  incoming: NormalizedEvent[]
): Promise<NormalizedEvent[]> {
  if (incoming.length === 0) return [];

  const hashes = incoming.map((e) =>
    contentHash(e.title, e.publishedAt, e.sourceType)
  );

  // Check which hashes already exist in the database
  const existingEvents = await Promise.all(
    hashes.map((hash) =>
      db
        .select({ contentHash: events.contentHash })
        .from(events)
        .where(eq(events.contentHash, hash))
        .limit(1)
    )
  );

  const existingHashes = new Set(
    existingEvents
      .flat()
      .map((e) => e.contentHash)
      .filter(Boolean)
  );

  return incoming.filter((event, i) => !existingHashes.has(hashes[i]));
}

export function computeHash(event: NormalizedEvent): string {
  return contentHash(event.title, event.publishedAt, event.sourceType);
}
