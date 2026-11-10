import {
  type BillingOverviewState,
  type PremiumView,
  toBillingOverview,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { getPointsOverview, getPremium, listPointsPackages } from "./api";

async function loadBillingOverview(): Promise<BillingOverviewState> {
  const [premium, points, packages] = await Promise.all([
    getPremium(),
    getPointsOverview(),
    listPointsPackages(),
  ]);
  return toBillingOverview(premium, points, packages);
}

export function useBillingOverview() {
  const [state, setState] = useState<BillingOverviewState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadBillingOverview().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState((current) =>
      current.status === "ready" ? current : { status: "loading" },
    );
    setAttempt((value) => value + 1);
  }, []);

  const setPremium = useCallback((premium: PremiumView) => {
    setState((current) =>
      current.status === "ready" ? { ...current, premium } : current,
    );
  }, []);

  return { state, reload, setPremium };
}
