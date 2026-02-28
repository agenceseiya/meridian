export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryBriefs } from "@/lib/db/queries/briefs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const briefs = await queryBriefs(page, limit);

  return NextResponse.json({ briefs, page, limit });
}
