import type { PlatformStatusResponse } from "@discordia/client-shared";
import { useCallback, useEffect, useState } from "react";

import { getPlatformStatus } from "../api";

export type PlatformStatusState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; data: PlatformStatusResponse };

/** Consulta el estado una vez al montarse; `retry` lo vuelve a pedir. */
export function usePlatformStatus() {
  const [state, setState] = useState<PlatformStatusState>({
    phase: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPlatformStatus().then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? {
              phase: "ready",
              data: { status: result.status, incidents: result.incidents },
            }
          : { phase: "error", message: result.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ phase: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  return { state, retry };
}
