export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateDailyBrief } from "@/lib/ai/brief-generator";

export async function POST(request: NextRequest) {
  try {
    const briefId = await generateDailyBrief();
    return NextResponse.json({ success: true, briefId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
