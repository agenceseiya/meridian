import { db } from "@/lib/db";
import { intelligenceBriefs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function queryBriefs(page = 1, limit = 10) {
  return db
    .select()
    .from(intelligenceBriefs)
    .orderBy(desc(intelligenceBriefs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

export async function getBriefById(id: string) {
  const result = await db
    .select()
    .from(intelligenceBriefs)
    .where(eq(intelligenceBriefs.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getLatestBrief() {
  const result = await db
    .select()
    .from(intelligenceBriefs)
    .orderBy(desc(intelligenceBriefs.createdAt))
    .limit(1);

  return result[0] || null;
}
