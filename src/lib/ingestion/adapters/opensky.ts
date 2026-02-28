import type { NormalizedEvent } from "../types";
import { ME_BOUNDS } from "@/lib/utils/constants";

const OPENSKY_API = "https://opensky-network.org/api/states/all";

// Known military ICAO24 hex ranges (partial list)
const MILITARY_ICAO_PREFIXES = [
  "ae", // US military (various blocks)
  "af", // US military
  "738", // Israeli Air Force
  "730", // Iranian military
  "400", // UK RAF
  "3b", // France military
  "4b", // Turkey military
];

interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export async function fetchOpenSky(
  sourceId: string
): Promise<NormalizedEvent[]> {
  const url = `${OPENSKY_API}?lamin=${ME_BOUNDS.latMin}&lomin=${ME_BOUNDS.lonMin}&lamax=${ME_BOUNDS.latMax}&lomax=${ME_BOUNDS.lonMax}`;

  const headers: Record<string, string> = {
    "User-Agent": "MERIDIAN-OSINT/1.0",
  };

  // Add auth if configured
  if (process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET) {
    const credentials = Buffer.from(
      `${process.env.OPENSKY_CLIENT_ID}:${process.env.OPENSKY_CLIENT_SECRET}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data = await response.json();
  const states: (string | number | boolean | null)[][] = data.states || [];

  const events: NormalizedEvent[] = [];

  for (const raw of states) {
    const state: OpenSkyState = {
      icao24: raw[0] as string,
      callsign: (raw[1] as string)?.trim() || null,
      origin_country: raw[2] as string,
      time_position: raw[3] as number | null,
      last_contact: raw[4] as number,
      longitude: raw[5] as number | null,
      latitude: raw[6] as number | null,
      baro_altitude: raw[7] as number | null,
      on_ground: raw[8] as boolean,
      velocity: raw[9] as number | null,
      true_track: raw[10] as number | null,
      vertical_rate: raw[11] as number | null,
      sensors: raw[12] as number[] | null,
      geo_altitude: raw[13] as number | null,
      squawk: raw[14] as string | null,
      spi: raw[15] as boolean,
      position_source: raw[16] as number,
    };

    if (!state.latitude || !state.longitude) continue;

    // Check if this is likely a military aircraft
    const isMilitary = MILITARY_ICAO_PREFIXES.some((prefix) =>
      state.icao24.startsWith(prefix)
    );

    if (!isMilitary) continue;

    const callsign = state.callsign || state.icao24;

    events.push({
      externalId: `opensky-${state.icao24}-${Date.now()}`,
      title: `Military aircraft: ${callsign} (${state.origin_country})`,
      summary: `${callsign} from ${state.origin_country} at ${state.geo_altitude || state.baro_altitude}m altitude, ${state.velocity ? Math.round(state.velocity * 3.6) : "?"} km/h`,
      latitude: state.latitude,
      longitude: state.longitude,
      locationName: `${state.latitude.toFixed(2)}N, ${state.longitude.toFixed(2)}E`,
      eventType: "aviation",
      publishedAt: new Date(
        (state.time_position || state.last_contact) * 1000
      ),
      sourceType: "flight_tracker",
      sourceId,
      tags: ["military", state.origin_country, callsign],
      rawData: state as unknown as Record<string, unknown>,
    });
  }

  return events;
}
