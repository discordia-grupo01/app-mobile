import { type ProfileSummary, resolveImageUrl } from "@discordia/client-shared";

import { env } from "./env";

/** URL absoluta de la foto del usuario, o `null` si no tiene (se muestra su inicial). */
export function avatarUriOf(
  profile: ProfileSummary | null | undefined,
): string | null {
  return resolveImageUrl(profile?.avatar_url, env.apiUrl);
}
