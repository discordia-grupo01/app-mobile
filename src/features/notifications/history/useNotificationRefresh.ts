import { NOTIFICATION_REFRESH_RETRY_DELAYS_MS } from "@discordia/client-shared";

import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export const NOTIFICATIONS_POLL_INTERVAL_MS = 30_000;

export function retryUntilFound(
  refresh: () => Promise<boolean>,
  delays: readonly number[] = NOTIFICATION_REFRESH_RETRY_DELAYS_MS,
): () => void {
  let isCancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const attempt = (index: number) => {
    timer = setTimeout(() => {
      void refresh().then((found) => {
        if (isCancelled || found || index + 1 >= delays.length) return;
        attempt(index + 1);
      });
    }, delays[index]);
  };

  if (delays.length > 0) attempt(0);

  return () => {
    isCancelled = true;
    clearTimeout(timer);
  };
}

export function useNotificationRefresh(
  signal: number,
  refresh: () => Promise<boolean>,
) {
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (signal === 0) return undefined;
    return retryUntilFound(() => refreshRef.current());
  }, [signal]);

  useEffect(() => {
    const refreshIfActive = () => {
      if (AppState.currentState === "active") void refreshRef.current();
    };
    const interval = setInterval(
      refreshIfActive,
      NOTIFICATIONS_POLL_INTERVAL_MS,
    );
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshRef.current();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);
}
