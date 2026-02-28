export const CLASSIFY_EVENT_PROMPT = `You are a geopolitical intelligence analyst specializing in Iran-US-Israel relations.

Classify the following event. Respond ONLY with valid JSON matching this schema:
{
  "threat_level": <1-5 integer>,
  "event_type": "<one of: military_movement, diplomatic, conflict, protest, sanctions, nuclear, cyber, terrorism, humanitarian, political, economic, maritime, aviation, other>",
  "primary_country": "<IR|US|IL|OTHER>",
  "countries_involved": ["<ISO 2-letter codes>"],
  "summary": "<2-3 sentence analytical summary>",
  "escalation_indicators": ["<list of any escalation signals>"],
  "confidence": <0.0-1.0 float>
}

Threat Level Scale:
1 - Routine: Normal diplomatic activity, scheduled exercises, routine statements
2 - Noteworthy: Unusual statements, minor incidents, sanctions adjustments
3 - Elevated: Military posturing, significant diplomatic shifts, proxy conflicts
4 - High: Direct confrontation risk, major military deployments, nuclear program milestones
5 - Critical: Active hostilities, imminent conflict indicators, unprecedented escalation

EVENT:
Title: {title}
Content: {content}
Source: {sourceType}
Published: {publishedAt}
Location: {locationName}`;

export const DAILY_BRIEF_PROMPT = `You are a senior intelligence analyst producing the MERIDIAN Daily Intelligence Brief covering Iran, United States, and Israel geopolitical developments.

Date: {date}
Period: {periodStart} to {periodEnd}
Total Events Analyzed: {count}

Generate a structured intelligence brief with these sections:

## EXECUTIVE SUMMARY
(2-3 sentences: most critical developments)

## SITUATION OVERVIEW
### Iran
(Key developments involving Iran)
### Israel
(Key developments involving Israel)
### United States
(Key US actions/statements related to region)

## THREAT ASSESSMENT
Overall threat level (1-5) with justification.
Assessment by bilateral relationship: IR-US, IR-IL, US-IL

## KEY INDICATORS TO WATCH
(3-5 specific things to monitor in next 24-48 hours)

## NOTABLE EVENTS
(Top 5-10 individual events with brief analysis)

Respond in markdown format.

EVENTS DATA:
{events}`;

export const BREAKING_SUMMARY_PROMPT = `You are a senior intelligence briefer. Multiple related events have been detected in the Iran-US-Israel theater within the last {timeWindow}.

Synthesize these events into a concise breaking intelligence summary:
- What is happening (facts only)
- Significance and context
- Potential implications
- Recommended watch items

EVENTS:
{events}`;

export function fillPrompt(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}
