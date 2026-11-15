import type { ServerSummary } from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "../../../../hooks/useRefreshOnChange";
import { listMyServers } from "../../../servers/api";

type ServerDirectory = Map<string, ServerSummary>;

/** Mis servidores por id, para nombrar los que boosteé. `null` mientras carga. */
export function useServerDirectory() {
  const [servers, setServers] = useState<ServerDirectory | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listMyServers().then((result) => {
      if (cancelled) return;
      // Sin lista no se puede nombrar ningún servidor: quedan como desconocidos.
      setServers((current) =>
        result.ok
          ? new Map(result.servers.map((server) => [server.id, server]))
          : (current ?? new Map()),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useRefreshOnChange({ resources: ["servers", "server", "boosts"] }, reload);

  return servers;
}
