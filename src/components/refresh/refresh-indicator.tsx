"use client";

import { useRefresh } from "./refresh-provider";
import { RefreshCw } from "lucide-react";

export function RefreshIndicator() {
  const { secondsUntilRefresh, refreshNow } = useRefresh();
  const progress = ((60 - secondsUntilRefresh) / 60) * 100;

  return (
    <button
      onClick={refreshNow}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors text-sm"
      title="Click to refresh now"
    >
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray={`${progress * 1.13} 113`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <RefreshCw className="absolute inset-0 m-auto w-2.5 h-2.5 text-[#94a3b8]" />
      </div>
      <span className="font-mono text-xs text-[#94a3b8]">
        {secondsUntilRefresh}s
      </span>
    </button>
  );
}
