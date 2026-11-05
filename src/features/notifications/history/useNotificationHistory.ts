import {
  appendNotificationHistory,
  NOTIFICATION_HISTORY_PAGE_SIZE,
  type NotificationHistoryItem,
} from "@discordia/client-shared";

import { useCallback, useEffect, useRef, useState } from "react";

import { listNotificationHistory } from "../api";

export type NotificationHistoryStatus = "loading" | "ready" | "error";

export function useNotificationHistory(userId: string | null) {
  const [items, setItems] = useState<NotificationHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<NotificationHistoryStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const generation = useRef(0);
  const isFetchingMore = useRef(false);
  const knownIds = useRef<ReadonlySet<string>>(new Set());

  useEffect(() => {
    knownIds.current = new Set(items.map((entry) => entry.message_id));
  }, [items]);

  const fetchFirstPage = useCallback(
    (current: number) =>
      listNotificationHistory({
        limit: NOTIFICATION_HISTORY_PAGE_SIZE,
      }).then((result) => {
        if (current !== generation.current) return;
        if (result.ok) {
          setItems(result.items);
          setNextCursor(result.nextCursor);
          setStatus("ready");
        } else {
          setError(result.message);
          setStatus("error");
        }
      }),
    [],
  );

  const reload = useCallback(() => {
    const current = ++generation.current;
    isFetchingMore.current = false;
    setIsLoadingMore(false);
    setLoadMoreError(null);
    setError(null);
    setStatus("loading");
    return fetchFirstPage(current);
  }, [fetchFirstPage]);

  useEffect(() => {
    if (userId) void fetchFirstPage(++generation.current);
  }, [userId, fetchFirstPage]);

  const loadMore = useCallback(() => {
    if (status !== "ready" || !nextCursor || isFetchingMore.current) return;

    const current = generation.current;
    isFetchingMore.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    void listNotificationHistory({
      limit: NOTIFICATION_HISTORY_PAGE_SIZE,
      before: nextCursor,
    }).then((result) => {
      if (current !== generation.current) return;
      isFetchingMore.current = false;
      setIsLoadingMore(false);
      if (result.ok) {
        setItems((previous) =>
          appendNotificationHistory(previous, result.items),
        );
        setNextCursor(result.nextCursor);
      } else {
        setLoadMoreError(result.message);
      }
    });
  }, [status, nextCursor]);

  const refresh = useCallback((): Promise<boolean> => {
    if (status !== "ready") return reload().then(() => false);

    const current = generation.current;
    return listNotificationHistory({
      limit: NOTIFICATION_HISTORY_PAGE_SIZE,
    }).then((result) => {
      if (current !== generation.current || !result.ok) return false;
      const hasNew = result.items.some(
        (entry) => !knownIds.current.has(entry.message_id),
      );
      setItems((previous) => appendNotificationHistory(result.items, previous));
      return hasNew;
    });
  }, [status, reload]);

  return {
    items,
    status,
    error,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreError,
    loadMore,
    reload,
    refresh,
  };
}

export type NotificationHistoryState = ReturnType<
  typeof useNotificationHistory
>;
