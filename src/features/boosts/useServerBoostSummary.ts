import type { ServerBoostSummary } from "@discordia/client-shared";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { getServerBoostSummary } from "./api";

interface LoadedSummary {
  serverId: string;
  summary: ServerBoostSummary | null;
  loadError: string;
}

export function useServerBoostSummary(serverId: string) {
  const [loaded, setLoaded] = useState<LoadedSummary | null>(null);
  const latestRequest = useRef(0);
  const current = loaded?.serverId === serverId ? loaded : null;

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const result = await getServerBoostSummary(serverId);
    if (requestId !== latestRequest.current) return;
    setLoaded((previous) =>
      result.ok
        ? { serverId, summary: result.summary, loadError: "" }
        : {
            serverId,
            summary: previous?.serverId === serverId ? previous.summary : null,
            loadError: result.message,
          },
    );
  }, [serverId]);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnChange({ resources: ["server"], serverId }, load);

  return {
    summary: current?.summary ?? null,
    loadError: current?.loadError ?? "",
    retry: load,
  };
}
