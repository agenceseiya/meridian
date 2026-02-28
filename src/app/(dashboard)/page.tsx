"use client";

import dynamic from "next/dynamic";
import { useEventStats, useAlerts } from "@/hooks/use-events";
import { TimelineFeed } from "@/components/timeline/timeline-feed";
import { MapLegend } from "@/components/map/map-legend";
import { ThreatBadge } from "@/components/shared/threat-badge";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Radio,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const EventMap = dynamic(
  () =>
    import("@/components/map/event-map").then((mod) => ({
      default: mod.EventMap,
    })),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-[#111827] rounded-lg border border-[#1e293b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#94a3b8] text-xs mt-3">Loading map...</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "#f97316",
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  color?: string;
}) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
        </div>
        <Icon className="w-8 h-8 opacity-20" style={{ color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats } = useEventStats();
  const { data: alertData } = useAlerts();

  const maxThreat = stats?.byThreatLevel
    ? Object.keys(stats.byThreatLevel)
        .filter((k) => k !== "unclassified")
        .sort()
        .pop() || "1"
    : null;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Alert banner */}
      {alertData?.alerts?.length > 0 &&
        alertData.alerts[0].severity === "flash" && (
          <div className="bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-lg px-4 py-3 flex items-center gap-3 threat-pulse">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#dc2626]">
                FLASH ALERT
              </p>
              <p className="text-xs text-[#fca5a5]">
                {alertData.alerts[0].title}
              </p>
            </div>
            <Link
              href="/dashboard/alerts"
              className="text-xs text-[#dc2626] hover:underline"
            >
              View &rarr;
            </Link>
          </div>
        )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Events (24h)"
          value={stats?.last24h || 0}
          icon={Activity}
        />
        <StatCard
          label="Active Alerts"
          value={alertData?.activeCount || 0}
          icon={AlertTriangle}
          color="#ef4444"
        />
        <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-4">
          <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider">
            Threat Level
          </p>
          <div className="mt-2">
            <ThreatBadge level={maxThreat} size="md" />
          </div>
        </div>
        <StatCard
          label="Total Events"
          value={stats?.total || 0}
          icon={BarChart3}
          color="#94a3b8"
        />
      </div>

      {/* Main content: Map + Recent Events */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Map */}
        <div className="lg:col-span-2 relative min-h-[400px]">
          <EventMap />
          <MapLegend />
        </div>

        {/* Recent Events sidebar */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Latest Events
            </h2>
            <Link
              href="/dashboard/timeline"
              className="text-xs text-[#f97316] hover:underline"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <TimelineFeed limit={10} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
