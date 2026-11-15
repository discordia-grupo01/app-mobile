import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { getPointsOverview } from "../billing/api";

export type PointsBalanceState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; balance: number };

export function usePointsBalance() {
  const [state, setState] = useState<PointsBalanceState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getPointsOverview().then((result) => {
      if (cancelled) return;
      setState((current) => {
        if (result.ok) {
          return { status: "ready", balance: Math.max(0, result.data.balance) };
        }
        return current.status === "ready"
          ? current
          : { status: "error", message: result.message };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useRefreshOnChange({ resources: ["points"] }, reload);

  return { state, reload };
}
