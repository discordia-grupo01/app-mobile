import {
  type CheckoutResponse,
  type PaymentReturnParams,
} from "@discordia/client-shared";

import type { BillingResult } from "../../api";

export type CheckoutItem =
  | { kind: "premium"; priceCents: number }
  | { kind: "points"; packageId: string; points: number; priceCents: number };

export interface CheckoutDeps {
  startPremium: (
    payerEmail: string,
    idempotencyKey: string,
  ) => Promise<BillingResult<CheckoutResponse>>;
  startPoints: (
    packageId: string,
    idempotencyKey: string,
  ) => Promise<BillingResult<CheckoutResponse>>;
  openCheckout: (url: string) => Promise<void>;
}

export type CheckoutOutcome =
  | { ok: true; payment: PaymentReturnParams }
  | { ok: false; code: string; message: string };

export async function runCheckout(
  item: CheckoutItem,
  payerEmail: string,
  idempotencyKey: string,
  deps: CheckoutDeps,
): Promise<CheckoutOutcome> {
  const result =
    item.kind === "premium"
      ? await deps.startPremium(payerEmail, idempotencyKey)
      : await deps.startPoints(item.packageId, idempotencyKey);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  await deps.openCheckout(result.data.checkout_url);

  const payment: PaymentReturnParams =
    item.kind === "points"
      ? { kind: "points", purchaseId: result.data.purchase_id ?? null }
      : { kind: "premium", purchaseId: null };
  return { ok: true, payment };
}
