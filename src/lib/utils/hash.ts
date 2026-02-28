import { createHash } from "crypto";

export function contentHash(
  title: string,
  publishedAt: Date | string,
  sourceType: string
): string {
  const normalized = `${title.trim().toLowerCase()}|${new Date(publishedAt).toISOString()}|${sourceType}`;
  return createHash("sha256").update(normalized).digest("hex");
}
