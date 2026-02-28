import { cn } from "@/lib/utils/cn";
import { THREAT_COLORS, THREAT_LABELS } from "@/lib/utils/constants";

interface ThreatBadgeProps {
  level: string | null | undefined;
  size?: "sm" | "md" | "lg";
}

export function ThreatBadge({ level, size = "sm" }: ThreatBadgeProps) {
  if (!level) {
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-[#1e293b] text-[#94a3b8]">
        Unclassified
      </span>
    );
  }

  const color = THREAT_COLORS[level] || "#94a3b8";
  const label = THREAT_LABELS[level] || `Level ${level}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-mono font-semibold",
        level === "5" && "threat-pulse",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base"
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
