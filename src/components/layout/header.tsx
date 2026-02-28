"use client";

import { useState } from "react";
import { Search, Bell } from "lucide-react";
import { RefreshIndicator } from "@/components/refresh/refresh-indicator";
import useSWR from "swr";
import { useRefresh } from "@/components/refresh/refresh-provider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { refreshKey } = useRefresh();

  const { data: alertData } = useSWR(
    `/api/alerts?active=true&_r=${refreshKey}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const activeAlerts = alertData?.activeCount || 0;

  return (
    <header className="h-14 bg-[#111827] border-b border-[#1e293b] flex items-center justify-between px-4 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                window.location.href = `/dashboard/events?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#f97316]/50"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <RefreshIndicator />

        {/* Alerts badge */}
        <a
          href="/dashboard/alerts"
          className="relative p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          <Bell className="w-5 h-5 text-[#94a3b8]" />
          {activeAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#ef4444] rounded-full text-[10px] font-bold flex items-center justify-center text-white threat-pulse">
              {activeAlerts}
            </span>
          )}
        </a>
      </div>
    </header>
  );
}
