import {
  authorFromUser,
  resolveImageUrl,
  type User,
} from "@discordia/client-shared";

import { env } from "../../lib/env";

/** El usuario logueado como autor de sus mensajes. */
export function authorFromProfile(user: User) {
  return authorFromUser(user, resolveImageUrl(user.avatar_url, env.apiUrl));
}
