import { formatDistanceToNow, format } from "date-fns";

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTimestamp(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy HH:mm 'UTC'");
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d, HH:mm");
}
