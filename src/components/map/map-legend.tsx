"use client";

import { THREAT_COLORS, THREAT_LABELS } from "@/lib/utils/constants";

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-[#111827]/90 backdrop-blur border border-[#1e293b] rounded-lg p-3 z-10">
      <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2 font-semibold">
        Threat Level
      </p>
      <div className="space-y-1.5">
        {Object.entries(THREAT_LABELS).map(([level, label]) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: THREAT_COLORS[level] }}
            />
            <span className="text-xs text-[#e2e8f0]">
              {level} - {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
