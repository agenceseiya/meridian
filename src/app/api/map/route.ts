export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryMapEvents } from "@/lib/db/queries/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params = {
    hours: Number(searchParams.get("hours")) || 24,
    threatLevel: searchParams.get("threatLevel") || undefined,
    eventType: searchParams.get("eventType") || undefined,
  };

  const events = await queryMapEvents(params);

  // Convert to GeoJSON FeatureCollection
  const geojson = {
    type: "FeatureCollection" as const,
    features: events
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [e.longitude!, e.latitude!],
        },
        properties: {
          id: e.id,
          title: e.title,
          summary: e.summary,
          eventType: e.eventType,
          threatLevel: e.threatLevel,
          primaryCountry: e.primaryCountry,
          sourceType: e.sourceType,
          locationName: e.locationName,
          publishedAt: e.publishedAt,
          url: e.url,
        },
      })),
  };

  return NextResponse.json(geojson, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
    },
  });
}
