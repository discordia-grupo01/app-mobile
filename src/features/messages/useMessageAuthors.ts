import {
  authorFromMember,
  type Member,
  type Message,
  type MessageAuthor,
  messageAuthorOf,
  PROFILE_FALLBACK_CONCURRENCY,
  resolveImageUrl,
  type Role,
} from "@discordia/client-shared";

import { useEffect, useMemo, useRef, useState } from "react";

import { env } from "../../lib/env";
import { getPublicProfile } from "../profile/service";

export function useMessageAuthors(
  members: Member[] | null,
  messages: Message[] | null,
  currentAuthor: MessageAuthor | null,
  serverRoles: Role[],
): Record<string, MessageAuthor> {
  const [extra, setExtra] = useState<Record<string, MessageAuthor>>({});
  const requested = useRef(new Set<string>());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const base = useMemo(() => {
    const byId: Record<string, MessageAuthor> = { ...extra };
    for (const member of members ?? []) {
      byId[member.user_id] = authorFromMember(
        member,
        resolveImageUrl(member.profile?.avatar_url, env.apiUrl),
        serverRoles,
      );
    }
    if (currentAuthor) {
      // El perfil propio es mas fresco, pero el rol sale de la copia del miembro.
      const asMember = byId[currentAuthor.id];
      byId[currentAuthor.id] = {
        ...currentAuthor,
        roleName: asMember?.roleName ?? null,
        roleColor: asMember?.roleColor ?? null,
      };
    }
    return byId;
  }, [members, extra, currentAuthor, serverRoles]);

  // Se espera a tener los miembros: antes de eso todo autor "falta" y se
  // pediria un perfil por cada uno sin necesidad.
  useEffect(() => {
    if (!messages || members === null) return;

    const queue = [
      ...new Set(
        messages.flatMap((message) => [
          message.user_id,
          ...(message.mentions ?? []),
        ]),
      ),
    ].filter((id) => !base[id] && !requested.current.has(id));
    queue.forEach((id) => requested.current.add(id));

    async function worker() {
      while (queue.length > 0 && isMounted.current) {
        const result = await getPublicProfile(queue.shift() as string);
        if (result.ok && isMounted.current) {
          const { id, name, avatar_url } = result.user;
          setExtra((prev) => ({
            ...prev,
            [id]: messageAuthorOf(
              id,
              name,
              resolveImageUrl(avatar_url, env.apiUrl),
            ),
          }));
        }
      }
    }
    void Promise.all(
      Array.from({ length: PROFILE_FALLBACK_CONCURRENCY }, worker),
    );
  }, [messages, members, base]);

  return base;
}
