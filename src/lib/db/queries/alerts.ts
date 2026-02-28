import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function queryAlerts(activeOnly = true) {
  const conditions = activeOnly ? eq(alerts.isActive, true) : undefined;

  return db
    .select()
    .from(alerts)
    .where(conditions)
    .orderBy(desc(alerts.createdAt))
    .limit(50);
}

export async function getActiveAlertCount() {
  const result = await db
    .select({ id: alerts.id })
    .from(alerts)
    .where(eq(alerts.isActive, true));

  return result.length;
}

export async function acknowledgeAlert(id: string) {
  return db
    .update(alerts)
    .set({
      isActive: false,
      acknowledgedAt: new Date(),
    })
    .where(eq(alerts.id, id));
}
