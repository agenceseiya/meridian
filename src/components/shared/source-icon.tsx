import {
  Rss,
  Globe,
  MessageCircle,
  Plane,
  Ship,
  Landmark,
  Database,
  Radio,
} from "lucide-react";
import { SOURCE_TYPE_LABELS } from "@/lib/utils/constants";

const iconMap: Record<string, typeof Rss> = {
  news_api: Globe,
  gdelt: Database,
  rss: Rss,
  twitter: MessageCircle,
  telegram: MessageCircle,
  flight_tracker: Plane,
  ship_tracker: Ship,
  government_feed: Landmark,
};

interface SourceIconProps {
  type: string | null | undefined;
  showLabel?: boolean;
}

export function SourceIcon({ type, showLabel = false }: SourceIconProps) {
  const Icon = type ? iconMap[type] || Radio : Radio;
  const label = type ? SOURCE_TYPE_LABELS[type] || type : "Unknown";

  return (
    <span className="inline-flex items-center gap-1.5 text-[#94a3b8]">
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span className="text-xs">{label}</span>}
    </span>
  );
}
