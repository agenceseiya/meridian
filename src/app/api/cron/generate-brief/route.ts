export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateDailyBrief } from "@/lib/ai/brief-generator";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const briefId = await generateDailyBrief();
    return NextResponse.json({ success: true, briefId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Brief generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
