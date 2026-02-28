export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { classifyBatch } from "@/lib/ai/classifier";
import { checkEscalation } from "@/lib/ai/escalation-detector";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const classification = await classifyBatch(20);
    const escalation = await checkEscalation();

    return NextResponse.json({
      ...classification,
      ...escalation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Batch analysis failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
