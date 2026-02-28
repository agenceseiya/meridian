export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryAlerts, getActiveAlertCount, acknowledgeAlert } from "@/lib/db/queries/alerts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";

  const [alertsList, count] = await Promise.all([
    queryAlerts(activeOnly),
    getActiveAlertCount(),
  ]);

  return NextResponse.json(
    { alerts: alertsList, activeCount: count },
    {
      headers: {
        "Cache-Control": "s-maxage=15, stale-while-revalidate=30",
      },
    }
  );
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, action } = body;

  if (action === "acknowledge" && id) {
    await acknowledgeAlert(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
