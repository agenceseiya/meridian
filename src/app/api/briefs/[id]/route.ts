export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getBriefById } from "@/lib/db/queries/briefs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brief = await getBriefById(id);

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  return NextResponse.json(brief);
}
