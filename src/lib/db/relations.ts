import { relations } from "drizzle-orm";
import {
  sources,
  events,
  alerts,
  intelligenceBriefs,
  ingestionLogs,
} from "./schema";

export const sourcesRelations = relations(sources, ({ many }) => ({
  events: many(events),
  ingestionLogs: many(ingestionLogs),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  source: one(sources, { fields: [events.sourceId], references: [sources.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  event: one(events, { fields: [alerts.eventId], references: [events.id] }),
  brief: one(intelligenceBriefs, {
    fields: [alerts.briefId],
    references: [intelligenceBriefs.id],
  }),
}));

export const ingestionLogsRelations = relations(ingestionLogs, ({ one }) => ({
  source: one(sources, {
    fields: [ingestionLogs.sourceId],
    references: [sources.id],
  }),
}));
