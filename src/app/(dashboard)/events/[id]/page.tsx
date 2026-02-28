"use client";

import { use } from "react";
import useSWR from "swr";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { SourceIcon } from "@/components/shared/source-icon";
import { TimeAgo } from "@/components/shared/time-ago";
import { EVENT_TYPE_LABELS } from "@/lib/utils/constants";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, isLoading } = useSWR(`/api/events/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event || event.error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">Event not found</p>
        <Link
          href="/dashboard/events"
          className="text-xs text-[#f97316] hover:underline mt-2 inline-block"
        >
          &larr; Back to events
        </Link>
      </div>
    );
  }

  const classification = event.aiClassification as Record<string, unknown> | null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-white mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to events
      </Link>

      <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <ThreatBadge level={event.threatLevel} size="md" />
          <CountryFlag code={event.primaryCountry} showName />
          {event.eventType && (
            <span className="text-xs px-2 py-0.5 rounded bg-[#1e293b] text-[#94a3b8]">
              {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-white">{event.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[#94a3b8]">
          <SourceIcon type={event.sourceType} showLabel />
          {event.locationName && (
            <span className="flex items-center gap-1 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {event.locationName}
            </span>
          )}
          <TimeAgo date={event.publishedAt} />
        </div>

        {/* Content */}
        {event.summary && (
          <div>
            <h3 className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
              AI Summary
            </h3>
            <p className="text-sm text-[#e2e8f0]">{event.summary}</p>
          </div>
        )}

        {event.content && (
          <div>
            <h3 className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
              Content
            </h3>
            <p className="text-sm text-[#cbd5e1] whitespace-pre-wrap">
              {event.content}
            </p>
          </div>
        )}

        {/* AI Classification */}
        {classification && (
          <div className="border-t border-[#1e293b] pt-4">
            <h3 className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">
              AI Classification
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {classification.confidence != null && (
                <div>
                  <span className="text-[#64748b]">Confidence:</span>{" "}
                  <span className="text-white">
                    {Math.round((classification.confidence as number) * 100)}%
                  </span>
                </div>
              )}
              {classification.countries_involved ? (
                <div>
                  <span className="text-[#64748b]">Countries:</span>{" "}
                  <span className="text-white">
                    {(classification.countries_involved as string[]).join(", ")}
                  </span>
                </div>
              ) : null}
              {classification.escalation_indicators &&
                (classification.escalation_indicators as string[]).length > 0 ? (
                  <div className="col-span-2">
                    <span className="text-[#64748b]">
                      Escalation Indicators:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {(classification.escalation_indicators as string[]).map(
                        (indicator, i) => (
                          <li
                            key={i}
                            className="text-xs text-[#fbbf24] flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#fbbf24]" />
                            {indicator}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : null}
            </div>
          </div>
        )}

        {/* Source link */}
        {event.url && (
          <div className="border-t border-[#1e293b] pt-4">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#f97316] hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              View original source
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
