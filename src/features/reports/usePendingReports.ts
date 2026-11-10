import { PENDING_REPORTS_POLL_MS } from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { fetchPendingReportsCount } from "./api";

type FetchCount = (serverId: string, userId: string) => Promise<number | null>;

export function usePendingReports(
  userId: string | null,
  serverIds: readonly string[],
  isAppActive: boolean,
  fetchCount: FetchCount = fetchPendingReportsCount,
) {
  const [byServer, setByServer] = useState<Record<string, number>>({});
  const key = serverIds.join(",");

  const fetchTotals = useCallback(
    (ids: readonly string[]) =>
      userId
        ? Promise.all(
            ids.map(async (id) => [id, await fetchCount(id, userId)] as const),
          )
        : Promise.resolve([]),
    [userId, fetchCount],
  );

  const applyTotals = useCallback(
    (results: readonly (readonly [string, number | null])[]) =>
      setByServer((current) => {
        const next = { ...current };
        for (const [id, total] of results) {
          if (total !== null) next[id] = total;
        }
        return next;
      }),
    [],
  );

  const refresh = useCallback(
    async (only?: string) => {
      if (key === "") return;
      applyTotals(await fetchTotals(only ? [only] : key.split(",")));
    },
    [key, fetchTotals, applyTotals],
  );

  useEffect(() => {
    if (key === "" || !isAppActive) return;
    const ids = key.split(",");
    const load = () => void fetchTotals(ids).then(applyTotals);
    load();
    const interval = setInterval(load, PENDING_REPORTS_POLL_MS);
    return () => clearInterval(interval);
  }, [key, isAppActive, fetchTotals, applyTotals]);

  return { byServer, refresh };
}
