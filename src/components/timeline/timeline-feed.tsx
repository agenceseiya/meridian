"use client";

import { useEvents } from "@/hooks/use-events";
import { TimelineItem } from "./timeline-item";
import { Loader2 } from "lucide-react";

interface TimelineFeedProps {
  limit?: number;
  params?: Record<string, string>;
  compact?: boolean;
}

export function TimelineFeed({
  limit = 20,
  params = {},
  compact = false,
}: TimelineFeedProps) {
  const { data, isLoading, error } = useEvents({
    limit: String(limit),
    ...params,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444] text-sm">Failed to load events</p>
        <p className="text-[#94a3b8] text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  const events = data?.events || [];

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#94a3b8] text-sm">No events found</p>
        <p className="text-[#64748b] text-xs mt-1">
          Events will appear once data ingestion starts
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? "2" : "3"}`}>
      {events.map((event: Record<string, unknown>) => (
        <TimelineItem
          key={event.id as string}
          event={event as TimelineItemProps["event"]}
        />
      ))}
    </div>
  );
}

type TimelineItemProps = React.ComponentProps<typeof TimelineItem>;
