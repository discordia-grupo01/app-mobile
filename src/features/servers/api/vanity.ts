import { saveVanityFailureMessage } from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";
import { appInviteLink } from "../../../lib/invite-links";

export type SetVanityResult =
  { ok: true; vanity_code: string | null } | { ok: false; message: string };

/** `PATCH /v1/servers/:id/vanity`. `code: null` la quita; ponerla pide nivel 3. */
export async function setVanityCode(
  serverId: string,
  code: string | null,
): Promise<SetVanityResult> {
  const result = await apiFetch<{ vanity_code: string | null }>(
    `/v1/servers/${serverId}/vanity`,
    { method: "PATCH", body: JSON.stringify({ code }) },
  );
  if (!result.ok) {
    return { ok: false, message: saveVanityFailureMessage(result) };
  }
  return { ok: true, vanity_code: result.data.vanity_code };
}

/** Entra por el mismo link de la app que una invitación. */
export function vanityLinkText(code: string): string {
  return appInviteLink(code);
}

/** "discordia://invite/": el prefijo fijo del campo. */
export function vanityLinkPrefix(): string {
  return appInviteLink("");
}
