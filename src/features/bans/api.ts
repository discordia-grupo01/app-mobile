import {
  type Ban,
  BAN_PAGE_LIMIT,
  type BanListResponse,
  banFailureOf,
  type BanMemberResult,
  collectAllPages,
  type ListBansResult,
  listBansFailureMessage,
  type UnbanMemberResult,
  unbanFailureMessage,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Misma API que usa `web-client` (`servers` via el gateway). Listar y revocar
 * exigen `BAN_MEMBERS`; banear ademas exige que el objetivo tenga un rol
 * estrictamente menor al del actor (lo valida el back, no el front).
 */

/** Trae TODOS los baneos: la busqueda por nombre y la paginacion son en memoria. */
export async function listBans(serverId: string): Promise<ListBansResult> {
  const result = await collectAllPages<Ban>(async (offset) => {
    const page = await apiFetch<BanListResponse>(
      `/v1/servers/${serverId}/bans?limit=${BAN_PAGE_LIMIT}&offset=${offset}`,
      { method: "GET" },
    );
    return page.ok
      ? { ...page, data: { items: page.data.bans, total: page.data.total } }
      : page;
  });

  if (!result.ok) {
    return { ok: false, message: listBansFailureMessage(result) };
  }
  return { ok: true, bans: result.data.items, total: result.data.total };
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
