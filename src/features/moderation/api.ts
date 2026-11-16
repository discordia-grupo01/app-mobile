import {
  type KickMemberResult,
  kickFailureMessage,
  listModerationAuditFailureMessage,
  type ListModerationAuditResult,
  type ModerationAuditPage,
  type MuteMemberResult,
  muteFailureMessage,
  type UnmuteMemberResult,
  unmuteFailureMessage,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Misma API que usa `web-client` (`servers` via el gateway). Expulsar exige
 * `KICK_MEMBERS` y que el objetivo tenga un rol estrictamente menor (lo valida
 * el back, no el front).
 */
export async function kickMember(
  serverId: string,
  userId: string,
): Promise<KickMemberResult> {
  const result = await apiFetch<void>(`/v1/servers/${serverId}/kicks`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  if (!result.ok) return { ok: false, message: kickFailureMessage(result) };
  return { ok: true };
}

/**
 * Silenciar (#60) exige `MANAGE_MESSAGES` y rango menor. `untilAt` es ISO;
 * `reason` es opcional (max 512 runas). Al vencer lo levanta el back solo.
 */
export async function muteMember(
  serverId: string,
  input: { userId: string; untilAt: string; reason: string },
): Promise<MuteMemberResult> {
  const result = await apiFetch<void>(`/v1/servers/${serverId}/mutes`, {
    method: "POST",
    body: JSON.stringify({
      user_id: input.userId,
      until_at: input.untilAt,
      reason: input.reason.trim() || null,
    }),
  });
  if (!result.ok) return { ok: false, message: muteFailureMessage(result) };
  return { ok: true };
}

/** Levanta el silencio antes de que venza (CA3 de #60). */
export async function unmuteMember(
  serverId: string,
  userId: string,
): Promise<UnmuteMemberResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/mutes/${userId}`,
    { method: "DELETE" },
  );
  if (!result.ok) return { ok: false, message: unmuteFailureMessage(result) };
  return { ok: true };
}

/** Ver el registro exige ser moderador: los tres permisos juntos. */
export async function listModerationAudit(
  serverId: string,
  query: { limit: number; offset: number },
): Promise<ListModerationAuditResult> {
  const result = await apiFetch<ModerationAuditPage>(
    `/v1/servers/${serverId}/moderation-audit?limit=${query.limit}&offset=${query.offset}`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: listModerationAuditFailureMessage(result) };
  }
  return { ok: true, entries: result.data.entries, total: result.data.total };
}
