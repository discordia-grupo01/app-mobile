import {
  displayInviteLink,
  saveVanityFailureMessage,
  vanityInviteLink,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";
import { env } from "../../../lib/env";

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

/** El link que se copia, con la base de la web como las invitaciones. */
export function vanityLinkText(code: string): string {
  return vanityInviteLink(code, env.webUrl);
}

/** Sin protocolo, como se muestra: "discordia.app/invite/". */
export function vanityLinkPrefix(): string {
  return displayInviteLink(vanityLinkText(""));
}
