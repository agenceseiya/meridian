export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { querySources } from "@/lib/db/queries/sources";

export async function GET() {
  const sourcesList = await querySources();
  return NextResponse.json({ sources: sourcesList });
}
