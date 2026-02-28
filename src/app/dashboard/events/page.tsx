"use client";

import { useSearchParams } from "next/navigation";
import { useEvents } from "@/hooks/use-events";
import { TimelineItem } from "@/components/timeline/timeline-item";
import { Loader2, Search } from "lucide-react";
import { useState, Suspense } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function EventsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);

  const { data: searchData, isLoading: searchLoading } = useSWR(
    activeQuery ? `/api/events/search?q=${encodeURIComponent(activeQuery)}` : null,
    fetcher
  );

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: "50",
  });

  const isSearching = activeQuery.length > 0;
  const events = isSearching
    ? searchData?.events || []
    : eventsData?.events || [];
  const isLoading = isSearching ? searchLoading : eventsLoading;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">Events</h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Search events (e.g., Iran nuclear, IDF, sanctions)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setActiveQuery(searchQuery);
          }}
          className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-[#1e293b] rounded-lg text-sm text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#f97316]/50"
        />
        {activeQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {isSearching && (
        <p className="text-xs text-[#94a3b8] mb-4">
          Searching for &quot;{activeQuery}&quot;...
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#94a3b8]">No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: Record<string, unknown>) => (
            <TimelineItem
              key={event.id as string}
              event={event as React.ComponentProps<typeof TimelineItem>["event"]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>}>
      <EventsContent />
    </Suspense>
  );
}
