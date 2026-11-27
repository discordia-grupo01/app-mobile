import {
  type Ban,
  type BanListResponse,
  banFailureOf,
  type BanMemberResult,
  type ListBansResult,
  listBansFailureMessage,
  type MemberPageQuery,
  memberPageQueryString,
  type UnbanMemberResult,
  unbanFailureMessage,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Misma API que usa `web-client` (`servers` via el gateway). Listar y revocar
 * exigen `BAN_MEMBERS`; banear ademas exige que el objetivo tenga un rol
 * estrictamente menor al del actor (lo valida el back, no el front).
 */

/** Una pagina de baneados, filtrada por nombre en el back (`q`). */
export async function listBans(
  serverId: string,
  query: MemberPageQuery = {},
): Promise<ListBansResult> {
  const result = await apiFetch<BanListResponse>(
    `/v1/servers/${serverId}/bans${memberPageQueryString(query)}`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: listBansFailureMessage(result) };
  }
  return { ok: true, bans: result.data.bans, total: result.data.total };
}

/** `reason` es opcional (max 512 runas). 409 si el usuario ya esta baneado. */
export async function banMember(
  serverId: string,
  input: { userId: string; reason: string },
): Promise<BanMemberResult> {
  const result = await apiFetch<Ban>(`/v1/servers/${serverId}/bans`, {
    method: "POST",
    body: JSON.stringify({
      user_id: input.userId,
      reason: input.reason.trim() || null,
    }),
  });

  if (!result.ok) {
    return { ok: false, ...banFailureOf(result) };
  }
  return { ok: true, ban: result.data };
}

/** El usuario puede volver con cualquier invitacion valida, como un miembro nuevo. */
export async function unbanMember(
  serverId: string,
  userId: string,
): Promise<UnbanMemberResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/bans/${userId}`,
    { method: "DELETE" },
  );

  return result.ok
    ? { ok: true }
    : { ok: false, message: unbanFailureMessage(result) };
}
