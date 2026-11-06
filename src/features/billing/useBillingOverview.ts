import {
  BILLING_LOAD_FAILED,
  type PointsOverview,
  type PointsPackage,
  type PremiumView,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { getPointsOverview, getPremium, listPointsPackages } from "./api";

export type BillingOverviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      premium: PremiumView;
      points: PointsOverview;
      packages: PointsPackage[];
    };

async function loadBillingOverview(): Promise<BillingOverviewState> {
  const [premium, points, packages] = await Promise.all([
    getPremium(),
    getPointsOverview(),
    listPointsPackages(),
  ]);
  if (premium.ok && points.ok && packages.ok) {
    return {
      status: "ready",
      premium: premium.data,
      points: points.data,
      packages: packages.data.packages,
    };
  }
  const failed = [premium, points, packages].find((result) => !result.ok);
  return {
    status: "error",
    message: failed && !failed.ok ? failed.message : BILLING_LOAD_FAILED,
  };
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
