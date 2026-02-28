"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils/date";

interface TimeAgoProps {
  date: string | Date | null | undefined;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!date) return;
    setText(timeAgo(date));
    const interval = setInterval(() => setText(timeAgo(date)), 30000);
    return () => clearInterval(interval);
  }, [date]);

  if (!date) return <span className="text-[#94a3b8]">Unknown</span>;

  return (
    <time
      dateTime={new Date(date).toISOString()}
      className="text-xs text-[#94a3b8] font-mono"
      title={new Date(date).toLocaleString()}
    >
      {text}
    </time>
  );
}
