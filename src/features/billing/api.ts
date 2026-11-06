import {
  BILLING_HISTORY_MAX_LIMIT,
  billingErrorMessage,
  type ApiFailure,
  type ApiResult,
  type CheckoutResponse,
  isNetworkFailure,
  messageFor,
  type PointPurchase,
  type PointsCheckoutRequest,
  type PointsOverview,
  type PointsPackagesResponse,
  type PremiumCheckoutRequest,
  type PremiumView,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";
import { BILLING_EXTRA_ERROR_MESSAGES } from "./billingCopy";

/**
 * Billing (Premium y puntos con Mercado Pago) por el Gateway:
 *
 *   GET  /v1/billing/premium[?refresh=1] -> 200 PremiumView
 *   POST /v1/billing/premium/checkout    -> 201 {checkout_url} | 409 ALREADY_SUBSCRIBED
 *   POST /v1/billing/premium/cancel      -> 200 PremiumView | 409 NO_LIVE_SUBSCRIPTION
 *   GET  /v1/billing/points/packages     -> 200 {packages}
 *   GET  /v1/billing/points?limit=       -> 200 {balance, ledger, purchases}
 *   POST /v1/billing/points/checkout     -> 201 {purchase_id, checkout_url} | 400 UNKNOWN_PACKAGE
 *   GET  /v1/billing/purchases/:id       -> 200 PointPurchase | 404 PURCHASE_NOT_FOUND
 *
 * Los dos checkouts aceptan `Idempotency-Key`: la misma clave devuelve el mismo
 * checkout durante 24 h, así un doble toque o un reintento no crean dos compras.
 */

export type BillingResult<T> =
  { ok: true; data: T } | { ok: false; code: string; message: string };

function toBillingResult<T>(result: ApiResult<T>): BillingResult<T> {
  if (result.ok) return { ok: true, data: result.data };
  return {
    ok: false,
    code: String(result.code),
    message: billingFailureMessage(result),
  };
}

export function billingFailureMessage(failure: ApiFailure): string {
  if (isNetworkFailure(failure)) return messageFor(failure);
  const code = String(failure.code);
  return BILLING_EXTRA_ERROR_MESSAGES[code] ?? billingErrorMessage(code);
}

// Mercado Pago vuelve a la página puente /app-link/billing/return de la web,
// que abre discordia://billing/return y cierra el navegador de la app.
const RETURN_TO_APP = { return_to: "app" } as const;

function idempotencyHeaders(key: string | undefined): HeadersInit {
  return key ? { "Idempotency-Key": key } : {};
}

export async function getPremium({
  refresh = false,
}: { refresh?: boolean } = {}): Promise<BillingResult<PremiumView>> {
  const path = refresh
    ? "/v1/billing/premium?refresh=1"
    : "/v1/billing/premium";
  return toBillingResult(await apiFetch<PremiumView>(path, { method: "GET" }));
}

export async function startPremiumCheckout(
  body: PremiumCheckoutRequest,
  idempotencyKey?: string,
): Promise<BillingResult<CheckoutResponse>> {
  return toBillingResult(
    await apiFetch<CheckoutResponse>("/v1/billing/premium/checkout", {
      method: "POST",
      headers: idempotencyHeaders(idempotencyKey),
      body: JSON.stringify({ ...body, ...RETURN_TO_APP }),
    }),
  );
}

export async function cancelPremium(): Promise<BillingResult<PremiumView>> {
  return toBillingResult(
    await apiFetch<PremiumView>("/v1/billing/premium/cancel", {
      method: "POST",
    }),
  );
}

export async function listPointsPackages(): Promise<
  BillingResult<PointsPackagesResponse>
> {
  return toBillingResult(
    await apiFetch<PointsPackagesResponse>("/v1/billing/points/packages", {
      method: "GET",
    }),
  );
}

export async function getPointsOverview(
  limit: number = BILLING_HISTORY_MAX_LIMIT,
): Promise<BillingResult<PointsOverview>> {
  return toBillingResult(
    await apiFetch<PointsOverview>(`/v1/billing/points?limit=${limit}`, {
      method: "GET",
    }),
  );
}

export async function startPointsCheckout(
  body: PointsCheckoutRequest,
  idempotencyKey?: string,
): Promise<BillingResult<CheckoutResponse>> {
  return toBillingResult(
    await apiFetch<CheckoutResponse>("/v1/billing/points/checkout", {
      method: "POST",
      headers: idempotencyHeaders(idempotencyKey),
      body: JSON.stringify({ ...body, ...RETURN_TO_APP }),
    }),
  );
}

export async function getPurchase(
  purchaseId: string,
): Promise<BillingResult<PointPurchase>> {
  return toBillingResult(
    await apiFetch<PointPurchase>(
      `/v1/billing/purchases/${encodeURIComponent(purchaseId)}`,
      { method: "GET" },
    ),
  );
}
