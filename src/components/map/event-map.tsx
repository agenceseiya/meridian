"use client";

import { useRef, useCallback, useState } from "react";
import Map, { Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapEvents } from "@/hooks/use-events";
import { THREAT_COLORS, MAP_DEFAULT_CENTER } from "@/lib/utils/constants";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { TimeAgo } from "@/components/shared/time-ago";
import { SourceIcon } from "@/components/shared/source-icon";

interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: Record<string, string>;
}

export function EventMap() {
  const { data: geojson, isLoading } = useMapEvents(48);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapToken) {
    return (
      <div className="w-full h-full bg-[#111827] rounded-lg border border-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#94a3b8] text-sm">Map requires NEXT_PUBLIC_MAPBOX_TOKEN</p>
          <p className="text-[#64748b] text-xs mt-1">Set it in .env.local</p>
        </div>
      </div>
    );
  }

  const handleClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || feature.geometry.type !== "Point") return;

    setPopupInfo({
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
      properties: feature.properties as Record<string, string>,
    });
  }, []);

  // Build circle color expression based on threat level
  const circleColor: mapboxgl.Expression = [
    "match",
    ["get", "threatLevel"],
    "1", THREAT_COLORS["1"],
    "2", THREAT_COLORS["2"],
    "3", THREAT_COLORS["3"],
    "4", THREAT_COLORS["4"],
    "5", THREAT_COLORS["5"],
    "#94a3b8", // default
  ];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-[#1e293b]">
      <Map
        initialViewState={{
          latitude: MAP_DEFAULT_CENTER.latitude,
          longitude: MAP_DEFAULT_CENTER.longitude,
          zoom: MAP_DEFAULT_CENTER.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapToken}
        interactiveLayerIds={["events-circle"]}
        onClick={handleClick}
        cursor="pointer"
      >
        <NavigationControl position="top-right" />

        {geojson && (
          <Source id="events" type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
            {/* Clustered circles */}
            <Layer
              id="clusters"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#f97316",
                  10, "#ef4444",
                  30, "#dc2626",
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  18,
                  10, 24,
                  30, 32,
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#0a0f1a",
              }}
            />

            {/* Cluster count */}
            <Layer
              id="cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
              }}
              paint={{
                "text-color": "#ffffff",
              }}
            />

            {/* Individual event circles */}
            <Layer
              id="events-circle"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": circleColor as unknown as string,
                "circle-radius": 7,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#0a0f1a",
                "circle-opacity": 0.9,
              }}
            />
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            maxWidth="300px"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ThreatBadge level={popupInfo.properties.threatLevel} />
                <CountryFlag code={popupInfo.properties.primaryCountry} />
              </div>
              <h3 className="text-sm font-semibold text-white leading-tight">
                {popupInfo.properties.title}
              </h3>
              {popupInfo.properties.summary && (
                <p className="text-xs text-[#94a3b8] line-clamp-3">
                  {popupInfo.properties.summary}
                </p>
              )}
              <div className="flex items-center justify-between">
                <SourceIcon type={popupInfo.properties.sourceType} showLabel />
                <TimeAgo date={popupInfo.properties.publishedAt} />
              </div>
              {popupInfo.properties.url && (
                <a
                  href={popupInfo.properties.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-[#f97316] hover:underline"
                >
                  Read source &rarr;
                </a>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
