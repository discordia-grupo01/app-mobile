import {
  type MessageAuthor,
  resolveImageUrl,
  type User,
} from "@discordia/client-shared";

import { env } from "../../lib/env";

// TODO: resolver etiqueta y color de rol cuando el back devuelva los mensajes con su autor.
export function authorFromProfile(user: User): MessageAuthor {
  return {
    id: String(user.id),
    name: user.name,
    avatarUrl: resolveImageUrl(user.avatar_url, env.apiUrl),
    roleName: null,
    roleColor: null,
  };
}
