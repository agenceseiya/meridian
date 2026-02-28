"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { REFRESH_INTERVAL_MS } from "@/lib/utils/constants";

interface RefreshContextValue {
  lastRefreshed: Date;
  secondsUntilRefresh: number;
  refreshNow: () => void;
  refreshKey: number;
}

const RefreshContext = createContext<RefreshContextValue>({
  lastRefreshed: new Date(),
  secondsUntilRefresh: 60,
  refreshNow: () => {},
  refreshKey: 0,
});

export function useRefresh() {
  return useContext(RefreshContext);
}

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshNow = useCallback(() => {
    setLastRefreshed(new Date());
    setSecondsUntilRefresh(60);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          refreshNow();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [refreshNow]);

  return (
    <RefreshContext.Provider
      value={{ lastRefreshed, secondsUntilRefresh, refreshNow, refreshKey }}
    >
      {children}
    </RefreshContext.Provider>
  );
}
