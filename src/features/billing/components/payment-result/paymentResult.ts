import {
  type PaymentProgress,
  type PaymentReturnParams,
  type PointPurchase,
  type PointsOverview,
  pointsPaymentProgress,
  premiumPaymentProgress,
  type PremiumView,
} from "@discordia/client-shared";

import type { BillingResult } from "../../api";

export interface PaymentResultState {
  progress: PaymentProgress;
  purchase: PointPurchase | null;
  premium: PremiumView | null;
  balance: number | null;
  error: string | null;
}

export const VERIFYING: PaymentResultState = {
  progress: { outcome: "verifying", done: false },
  purchase: null,
  premium: null,
  balance: null,
  error: null,
};

export type PaymentStep =
  { kind: "progress"; state: PaymentResultState } | { kind: "failed" };

export interface PaymentStatusApi {
  getPurchase: (purchaseId: string) => Promise<BillingResult<PointPurchase>>;
  getPointsOverview: () => Promise<BillingResult<PointsOverview>>;
  getPremium: (options: {
    refresh: boolean;
  }) => Promise<BillingResult<PremiumView>>;
}

async function checkPoints(
  purchaseId: string,
  elapsedMs: number,
  api: PaymentStatusApi,
): Promise<PaymentStep> {
  const result = await api.getPurchase(purchaseId);
  if (!result.ok && result.code !== "PURCHASE_NOT_FOUND") {
    return { kind: "failed" };
  }
  const purchase = result.ok ? result.data : null;
  const progress = pointsPaymentProgress(purchase, elapsedMs);

  let balance: number | null = null;
  if (progress.outcome === "points_accredited") {
    const overview = await api.getPointsOverview();
    if (overview.ok) balance = overview.data.balance;
  }
  return {
    kind: "progress",
    state: { ...VERIFYING, progress, purchase, balance },
  };
}

async function checkPremium(
  elapsedMs: number,
  api: PaymentStatusApi,
): Promise<PaymentStep> {
  const result = await api.getPremium({ refresh: true });
  if (!result.ok) return { kind: "failed" };
  return {
    kind: "progress",
    state: {
      ...VERIFYING,
      progress: premiumPaymentProgress(result.data, elapsedMs),
      premium: result.data,
    },
  };
}

export function checkPaymentStep(
  params: PaymentReturnParams,
  elapsedMs: number,
  api: PaymentStatusApi,
): Promise<PaymentStep> {
  if (params.kind === "points" && params.purchaseId) {
    return checkPoints(params.purchaseId, elapsedMs, api);
  }
  return checkPremium(elapsedMs, api);
}
