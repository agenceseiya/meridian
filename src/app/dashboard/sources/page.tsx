"use client";

import useSWR from "swr";
import { useRefresh } from "@/components/refresh/refresh-provider";
import { SourceIcon } from "@/components/shared/source-icon";
import { TimeAgo } from "@/components/shared/time-ago";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SourcesPage() {
  const { refreshKey } = useRefresh();
  const { data, isLoading } = useSWR(
    `/api/sources?_r=${refreshKey}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const sources = data?.sources || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Data Sources</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] border border-[#1e293b] rounded-lg">
          <p className="text-[#94a3b8]">No sources configured yet</p>
          <p className="text-[#64748b] text-xs mt-1">
            Sources are auto-created on first ingestion run
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sources.map(
            (source: {
              id: string;
              name: string;
              type: string;
              url: string | null;
              isActive: boolean;
              lastStatus: string | null;
              lastError: string | null;
              lastFetchAt: string | null;
              eventCount: number;
              fetchIntervalSeconds: number;
            }) => (
              <div
                key={source.id}
                className="bg-[#111827] border border-[#1e293b] rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SourceIcon type={source.type} />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {source.name}
                      </h3>
                      {source.url && (
                        <p className="text-[10px] text-[#64748b] font-mono">
                          {source.url}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {source.lastStatus === "ok" ? (
                      <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                    ) : source.lastStatus === "error" ? (
                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#94a3b8]" />
                    )}
                    <span
                      className={`text-xs font-mono ${
                        source.lastStatus === "ok"
                          ? "text-[#22c55e]"
                          : source.lastStatus === "error"
                            ? "text-[#ef4444]"
                            : "text-[#94a3b8]"
                      }`}
                    >
                      {source.lastStatus || "pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-[#64748b]">
                  <span>Events: {source.eventCount}</span>
                  <span>
                    Interval: {Math.round(source.fetchIntervalSeconds / 60)}m
                  </span>
                  {source.lastFetchAt && (
                    <span className="flex items-center gap-1">
                      Last fetch: <TimeAgo date={source.lastFetchAt} />
                    </span>
                  )}
                </div>

                {source.lastError && (
                  <p className="text-xs text-[#ef4444] mt-2 font-mono bg-[#ef4444]/5 px-2 py-1 rounded">
                    {source.lastError}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
