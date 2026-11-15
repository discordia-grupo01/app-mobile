import {
  type BillingResult,
  type Boost,
  type BoostedServersPage,
  boostedServersPageParams,
  type BoostPage,
  BOOSTS_LOAD_ERROR,
  boostsPageParams,
  messageFor,
  type ServerBoostSummary,
  toServerBoostSummary,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";
import { toBillingResult } from "../billing/api";

/**
 * Boosts por el Gateway:
 *
 *   GET    /v1/servers/:id/boosts    -> 200 resumen del servidor (servers)
 *   POST   /v1/billing/boosts        -> 202 boost "pending" | 409 INSUFFICIENT_POINTS
 *   GET    /v1/billing/boosts?server_id=&limit=&offset= -> 200 BoostPage: los míos en un servidor, retirados incluidos
 *   GET    /v1/billing/boosts/servers?limit=&offset=    -> 200 BoostedServersPage: los servidores que boosteé
 *   GET    /v1/billing/boosts/:id    -> 200 boost | 404 BOOST_NOT_FOUND
 *   DELETE /v1/billing/boosts/:id    -> 200 boost "removed" | 409 BOOST_NOT_ACTIVE
 *
 * El POST acepta `Idempotency-Key`: un doble toque con la misma clave devuelve
 * el mismo boost en vez de cobrar dos veces.
 */

export type ServerBoostSummaryResult =
  { ok: true; summary: ServerBoostSummary } | { ok: false; message: string };

export async function getServerBoostSummary(
  serverId: string,
): Promise<ServerBoostSummaryResult> {
  const result = await apiFetch<unknown>(`/v1/servers/${serverId}/boosts`, {
    method: "GET",
  });
  if (!result.ok) {
    return { ok: false, message: messageFor(result, {}, BOOSTS_LOAD_ERROR) };
  }
  return { ok: true, summary: toServerBoostSummary(result.data) };
}

function boostPath(boostId: string): string {
  return `/v1/billing/boosts/${encodeURIComponent(boostId)}`;
}

export async function requestBoost(
  serverId: string,
  idempotencyKey: string,
): Promise<BillingResult<Boost>> {
  return toBillingResult(
    await apiFetch<Boost>("/v1/billing/boosts", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ server_id: serverId }),
    }),
  );
}

function withQuery(path: string, params: Record<string, string>): string {
  return `${path}?${new URLSearchParams(params).toString()}`;
}

export async function listServerBoostsPage(
  serverId: string,
  page: number,
): Promise<BillingResult<BoostPage>> {
  return toBillingResult(
    await apiFetch<BoostPage>(
      withQuery("/v1/billing/boosts", boostsPageParams(serverId, page)),
      { method: "GET" },
    ),
  );
}

/** Una página (1-based) de los servidores que boosteé. */
export async function listBoostedServersPage(
  page: number,
): Promise<BillingResult<BoostedServersPage>> {
  return toBillingResult(
    await apiFetch<BoostedServersPage>(
      withQuery("/v1/billing/boosts/servers", boostedServersPageParams(page)),
      { method: "GET" },
    ),
  );
}

export async function getBoost(boostId: string): Promise<BillingResult<Boost>> {
  return toBillingResult(
    await apiFetch<Boost>(boostPath(boostId), { method: "GET" }),
  );
}

export async function removeBoost(
  boostId: string,
): Promise<BillingResult<Boost>> {
  return toBillingResult(
    await apiFetch<Boost>(boostPath(boostId), { method: "DELETE" }),
  );
}
