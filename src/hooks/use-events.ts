"use client";

import useSWR from "swr";
import { useRefresh } from "@/components/refresh/refresh-provider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useEvents(params?: Record<string, string>) {
  const { refreshKey } = useRefresh();
  const searchParams = new URLSearchParams(params);
  searchParams.set("_r", String(refreshKey));

  return useSWR(`/api/events?${searchParams}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });
}

export function useEventStats() {
  const { refreshKey } = useRefresh();

  return useSWR(`/api/events?stats=true&_r=${refreshKey}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
}

export function useMapEvents(hours = 24) {
  const { refreshKey } = useRefresh();

  return useSWR(`/api/map?hours=${hours}&_r=${refreshKey}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
}

export function useAlerts() {
  const { refreshKey } = useRefresh();

  return useSWR(`/api/alerts?active=true&_r=${refreshKey}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
}

export function useBriefs() {
  const { refreshKey } = useRefresh();

  return useSWR(`/api/briefs?_r=${refreshKey}`, fetcher, {
    refreshInterval: 60000,
  });
}
