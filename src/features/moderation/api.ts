import {
  type KickMemberResult,
  kickFailureMessage,
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
