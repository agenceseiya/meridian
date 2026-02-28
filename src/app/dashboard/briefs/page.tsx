"use client";

import { useBriefs } from "@/hooks/use-events";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { TimeAgo } from "@/components/shared/time-ago";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BriefsPage() {
  const { data, isLoading } = useBriefs();
  const briefs = data?.briefs || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Intelligence Briefs</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
        </div>
      ) : briefs.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] border border-[#1e293b] rounded-lg">
          <FileText className="w-12 h-12 text-[#1e293b] mx-auto" />
          <p className="text-[#94a3b8] mt-3">No briefs generated yet</p>
          <p className="text-[#64748b] text-xs mt-1">
            Briefs are auto-generated daily at 06:00 UTC
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {briefs.map(
            (brief: {
              id: string;
              title: string;
              type: string;
              executiveSummary: string;
              threatAssessment: Record<string, unknown> | null;
              createdAt: string;
            }) => (
              <Link
                key={brief.id}
                href={`/dashboard/briefs/${brief.id}`}
                className="block bg-[#111827] border border-[#1e293b] rounded-lg p-4 hover:border-[#334155] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] uppercase tracking-wider font-semibold">
                    {brief.type}
                  </span>
                  {brief.threatAssessment?.overall ? (
                    <ThreatBadge
                      level={String(brief.threatAssessment.overall)}
                    />
                  ) : null}
                </div>
                <h2 className="text-sm font-semibold text-white">
                  {brief.title}
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                  {brief.executiveSummary}
                </p>
                <div className="mt-2">
                  <TimeAgo date={brief.createdAt} />
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
