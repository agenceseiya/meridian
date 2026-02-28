import { db } from "@/lib/db";
import { events, intelligenceBriefs } from "@/lib/db/schema";
import { desc, gte, and } from "drizzle-orm";
import { anthropic, ANALYSIS_MODEL } from "./client";
import { DAILY_BRIEF_PROMPT, fillPrompt } from "./prompts";

export async function generateDailyBrief(): Promise<string> {
  const periodEnd = new Date();
  const periodStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Fetch events from last 24 hours
  const recentEvents = await db
    .select()
    .from(events)
    .where(
      and(gte(events.publishedAt, periodStart))
    )
    .orderBy(desc(events.publishedAt))
    .limit(100);

  if (recentEvents.length === 0) {
    return "No events in the last 24 hours.";
  }

  // Format events for the prompt
  const eventsText = recentEvents
    .map(
      (e, i) =>
        `${i + 1}. [${e.threatLevel || "?"}] ${e.title}\n   Source: ${e.sourceType} | Country: ${e.primaryCountry || "?"} | Location: ${e.locationName || "?"}\n   Published: ${e.publishedAt?.toISOString()}\n   Summary: ${e.summary || "N/A"}`
    )
    .join("\n\n");

  const prompt = fillPrompt(DAILY_BRIEF_PROMPT, {
    date: new Date().toISOString().split("T")[0],
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    count: String(recentEvents.length),
    events: eventsText,
  });

  const response = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const briefContent =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract executive summary (first paragraph after ## EXECUTIVE SUMMARY)
  const execMatch = briefContent.match(
    /## EXECUTIVE SUMMARY\n+([\s\S]*?)(?=\n##|\n\n##)/
  );
  const executiveSummary = execMatch
    ? execMatch[1].trim()
    : briefContent.slice(0, 300);

  // Store brief
  const brief = await db
    .insert(intelligenceBriefs)
    .values({
      type: "daily",
      title: `Daily Intelligence Brief - ${new Date().toISOString().split("T")[0]}`,
      executiveSummary,
      fullContent: briefContent,
      keyFindings: extractKeyFindings(briefContent),
      threatAssessment: extractThreatAssessment(briefContent),
      eventIds: recentEvents.map((e) => e.id),
      modelUsed: ANALYSIS_MODEL,
      promptTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      periodStart,
      periodEnd,
    })
    .returning({ id: intelligenceBriefs.id });

  return brief[0]?.id || "Brief generated";
}

function extractKeyFindings(content: string): string[] {
  const section = content.match(
    /## KEY INDICATORS TO WATCH\n+([\s\S]*?)(?=\n##|$)/
  );
  if (!section) return [];
  return section[1]
    .split("\n")
    .filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function extractThreatAssessment(
  content: string
): Record<string, unknown> | null {
  const section = content.match(
    /## THREAT ASSESSMENT\n+([\s\S]*?)(?=\n##|$)/
  );
  if (!section) return null;
  // Try to extract threat level number
  const levelMatch = section[1].match(/(\d)\s*(?:\/\s*5|out of 5)/i);
  return {
    overall: levelMatch ? parseInt(levelMatch[1]) : null,
    text: section[1].trim(),
  };
}
