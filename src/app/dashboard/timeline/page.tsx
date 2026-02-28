"use client";

import { useState } from "react";
import { TimelineFeed } from "@/components/timeline/timeline-feed";
import { THREAT_LABELS, EVENT_TYPE_LABELS, COUNTRIES, SOURCE_TYPE_LABELS } from "@/lib/utils/constants";

export default function TimelinePage() {
  const [threatLevel, setThreatLevel] = useState("");
  const [eventType, setEventType] = useState("");
  const [country, setCountry] = useState("");
  const [sourceType, setSourceType] = useState("");

  const params: Record<string, string> = {};
  if (threatLevel) params.threatLevel = threatLevel;
  if (eventType) params.eventType = eventType;
  if (country) params.country = country;
  if (sourceType) params.sourceType = sourceType;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">Event Timeline</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={threatLevel}
          onChange={(e) => setThreatLevel(e.target.value)}
          className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Threat Levels</option>
          {Object.entries(THREAT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {val} - {label}
            </option>
          ))}
        </select>

        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Event Types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Countries</option>
          {Object.entries(COUNTRIES).map(([code, data]) => (
            <option key={code} value={code}>
              {data.flag} {data.name}
            </option>
          ))}
        </select>

        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Sources</option>
          {Object.entries(SOURCE_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        {(threatLevel || eventType || country || sourceType) && (
          <button
            onClick={() => {
              setThreatLevel("");
              setEventType("");
              setCountry("");
              setSourceType("");
            }}
            className="text-xs text-[#f97316] hover:underline px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <TimelineFeed limit={50} params={params} />
    </div>
  );
}
