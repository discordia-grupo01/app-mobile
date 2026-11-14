import {
  BOOSTS_LOAD_ERROR,
  messageFor,
  type ServerBoostSummary,
  toServerBoostSummary,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

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
