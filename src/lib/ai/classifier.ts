import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { anthropic, CLASSIFICATION_MODEL } from "./client";
import { CLASSIFY_EVENT_PROMPT, fillPrompt } from "./prompts";

interface ClassificationResult {
  threat_level: number;
  event_type: string;
  primary_country: string;
  countries_involved: string[];
  summary: string;
  escalation_indicators: string[];
  confidence: number;
}

export async function classifyBatch(batchSize = 20): Promise<{
  classified: number;
  errors: number;
}> {
  // Get unclassified events
  const unclassified = await db
    .select()
    .from(events)
    .where(isNull(events.threatLevel))
    .orderBy(desc(events.publishedAt))
    .limit(batchSize);

  let classified = 0;
  let errors = 0;

  for (const event of unclassified) {
    try {
      const prompt = fillPrompt(CLASSIFY_EVENT_PROMPT, {
        title: event.title,
        content: event.content || event.summary || "",
        sourceType: event.sourceType || "unknown",
        publishedAt: event.publishedAt?.toISOString() || "unknown",
        locationName: event.locationName || "unknown",
      });

      const response = await anthropic.messages.create({
        model: CLASSIFICATION_MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        errors++;
        continue;
      }

      const result: ClassificationResult = JSON.parse(jsonMatch[0]);

      await db
        .update(events)
        .set({
          threatLevel: String(
            Math.min(5, Math.max(1, result.threat_level))
          ) as "1" | "2" | "3" | "4" | "5",
          eventType: result.event_type as typeof event.eventType,
          primaryCountry: result.primary_country as typeof event.primaryCountry,
          countriesInvolved: result.countries_involved,
          summary: result.summary,
          aiClassification: result as unknown as Record<string, unknown>,
          classifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(events.id, event.id));

      classified++;
    } catch (error) {
      console.error(`Classification failed for event ${event.id}:`, error);
      errors++;
    }
  }

  return { classified, errors };
}
