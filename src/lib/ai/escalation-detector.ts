import { db } from "@/lib/db";
import { events, alerts } from "@/lib/db/schema";
import { gte, and, inArray, desc, sql } from "drizzle-orm";

export async function checkEscalation(): Promise<{
  alertsCreated: number;
}> {
  let alertsCreated = 0;

  // Check 1: Any single event classified as threat level 4 or 5
  const highThreatEvents = await db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.threatLevel, ["4", "5"]),
        gte(events.classifiedAt, new Date(Date.now() - 15 * 60 * 1000)) // Last 15 min
      )
    )
    .orderBy(desc(events.publishedAt))
    .limit(10);

  for (const event of highThreatEvents) {
    // Check if alert already exists for this event
    const existing = await db
      .select({ id: alerts.id })
      .from(alerts)
      .where(sql`${alerts.eventId} = ${event.id}`)
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(alerts).values({
      severity: event.threatLevel === "5" ? "flash" : "critical",
      title: `High Threat: ${event.title}`,
      description: event.summary || event.title,
      eventId: event.id,
      triggerReason: `Single event classified as threat level ${event.threatLevel}`,
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    alertsCreated++;
  }

  // Check 2: Velocity trigger - 5+ events of level 3+ in 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const elevatedEvents = await db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.threatLevel, ["3", "4", "5"]),
        gte(events.publishedAt, twoHoursAgo)
      )
    );

  if (elevatedEvents.length >= 5) {
    // Check if we already have a velocity alert in the last 2 hours
    const existingVelocity = await db
      .select({ id: alerts.id })
      .from(alerts)
      .where(
        and(
          sql`${alerts.triggerReason} LIKE 'Velocity trigger%'`,
          gte(alerts.createdAt, twoHoursAgo)
        )
      )
      .limit(1);

    if (existingVelocity.length === 0) {
      await db.insert(alerts).values({
        severity: "warning",
        title: `Escalation Pattern: ${elevatedEvents.length} elevated events in 2 hours`,
        description: `${elevatedEvents.length} events classified at threat level 3 or above detected in the last 2 hours`,
        triggerReason: `Velocity trigger: ${elevatedEvents.length} events >= level 3 in 2h`,
        isActive: true,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      });
      alertsCreated++;
    }
  }

  return { alertsCreated };
}
