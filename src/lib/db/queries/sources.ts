import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function querySources() {
  return db.select().from(sources).orderBy(sources.name);
}

export async function getSourceByType(type: string) {
  const result = await db
    .select()
    .from(sources)
    .where(eq(sources.type, type as typeof sources.type.enumValues[number]))
    .limit(1);

  return result[0] || null;
}

export async function upsertSource(data: {
  name: string;
  type: string;
  url?: string;
}) {
  // Try to find existing source by name
  const existing = await db
    .select()
    .from(sources)
    .where(eq(sources.name, data.name))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const result = await db
    .insert(sources)
    .values({
      name: data.name,
      type: data.type as typeof sources.type.enumValues[number],
      url: data.url,
    })
    .returning();

  return result[0];
}

export async function updateSourceStatus(
  id: string,
  status: string,
  error?: string
) {
  await db
    .update(sources)
    .set({
      lastFetchAt: new Date(),
      lastStatus: status,
      lastError: error || null,
      updatedAt: new Date(),
    })
    .where(eq(sources.id, id));
}
