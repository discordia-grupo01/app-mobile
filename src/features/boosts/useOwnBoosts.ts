import type { Boost } from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { getPointsOverview } from "../billing/api";
import { listOwnBoosts } from "./api";

export type OwnBoostsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; boosts: Boost[]; balance: number };

async function loadOwnBoosts(): Promise<OwnBoostsState> {
  const [boosts, points] = await Promise.all([
    listOwnBoosts(),
    getPointsOverview(),
  ]);
  if (!boosts.ok) return { status: "error", message: boosts.message };
  if (!points.ok) return { status: "error", message: points.message };
  return {
    status: "ready",
    boosts: boosts.data,
    balance: Math.max(0, points.data.balance),
  };
}

/** Mis boosts de todos los servidores y el saldo de puntos para boostear. */
export function useOwnBoosts() {
  const [state, setState] = useState<OwnBoostsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadOwnBoosts().then((next) => {
      if (cancelled) return;
      // Si ya había datos, un refresco que falla no los tapa con un error.
      setState((current) =>
        next.status === "error" && current.status === "ready" ? current : next,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useRefreshOnChange({ resources: ["boosts", "points"] }, reload);

  const replaceBoost = useCallback((boost: Boost) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            boosts: current.boosts.map((item) =>
              item.id === boost.id ? boost : item,
            ),
          }
        : current,
    );
  }, []);

  return { state, reload, replaceBoost };
}

export type OwnBoosts = ReturnType<typeof useOwnBoosts>;
