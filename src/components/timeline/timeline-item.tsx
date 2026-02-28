"use client";

import Link from "next/link";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { TimeAgo } from "@/components/shared/time-ago";
import { SourceIcon } from "@/components/shared/source-icon";
import { ExternalLink, MapPin } from "lucide-react";
import { EVENT_TYPE_LABELS } from "@/lib/utils/constants";

interface TimelineItemProps {
  event: {
    id: string;
    title: string;
    summary?: string | null;
    threatLevel?: string | null;
    eventType?: string | null;
    primaryCountry?: string | null;
    sourceType?: string | null;
    locationName?: string | null;
    publishedAt?: string | null;
    url?: string | null;
  };
  isNew?: boolean;
}

export function TimelineItem({ event, isNew }: TimelineItemProps) {
  return (
    <div
      className={`bg-[#111827] border border-[#1e293b] rounded-lg p-4 hover:border-[#334155] transition-colors ${isNew ? "event-new" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header: threat + country + type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <ThreatBadge level={event.threatLevel} />
            <CountryFlag code={event.primaryCountry} />
            {event.eventType && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#94a3b8] uppercase tracking-wider">
                {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/dashboard/events/${event.id}`}
            className="text-sm font-medium text-white hover:text-[#f97316] transition-colors leading-tight"
          >
            {event.title}
          </Link>

          {/* Summary */}
          {event.summary && (
            <p className="text-xs text-[#94a3b8] mt-1.5 line-clamp-2">
              {event.summary}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2.5 text-[#64748b]">
            <SourceIcon type={event.sourceType} showLabel />
            {event.locationName && (
              <span className="flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                {event.locationName}
              </span>
            )}
            <TimeAgo date={event.publishedAt} />
          </div>
        </div>

        {/* External link */}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-[#1e293b] transition-colors text-[#64748b] hover:text-[#f97316]"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
