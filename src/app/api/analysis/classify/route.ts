export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { classifyBatch } from "@/lib/ai/classifier";

export async function POST(request: NextRequest) {
  try {
    const result = await classifyBatch(1);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
