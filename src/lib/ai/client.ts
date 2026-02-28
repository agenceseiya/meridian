import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const CLASSIFICATION_MODEL = "claude-haiku-4-5-20251001";
export const ANALYSIS_MODEL = "claude-sonnet-4-20250514";
