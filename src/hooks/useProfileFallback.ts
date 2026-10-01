import {
  type MemberProfile,
  memberProfileOf,
  PROFILE_FALLBACK_CONCURRENCY,
  userIdsMissingProfile,
  withFetchedProfiles,
} from "@discordia/client-shared";

import { useEffect, useMemo, useRef, useState } from "react";

import { getPublicProfile } from "../features/profile/service";

interface ProfiledUser {
  user_id: string;
  /** `null` mientras el back no replico el perfil de este usuario. */
  profile?: MemberProfile | null;
}

/**
 * Devuelve la misma lista (miembros o baneados) con los `profile: null`
 * completados. El back adjunta el perfil a cada usuario, asi que normalmente
 * no se pide nada: solo para los que todavia no se replicaron cae a
 * `GET /users/:id`, de a `PROFILE_FALLBACK_CONCURRENCY` y sin repetir un id.
 * Si ese pedido falla el usuario queda sin perfil ("Usuario desconocido").
 */
export function useProfileFallback<T extends ProfiledUser>(
  users: readonly T[] | null,
): T[] | null {
  const [fetched, setFetched] = useState<Record<string, MemberProfile>>({});
  const requested = useRef(new Set<string>());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const queue = userIdsMissingProfile(users ?? [], requested.current);
    queue.forEach((id) => requested.current.add(id));

    async function worker() {
      while (queue.length > 0 && isMounted.current) {
        const result = await getPublicProfile(queue.shift() as string);
        if (result.ok && isMounted.current) {
          const profile = memberProfileOf(result.user);
          setFetched((prev) => ({ ...prev, [result.user.id]: profile }));
        }
      }
    }
    void Promise.all(
      Array.from({ length: PROFILE_FALLBACK_CONCURRENCY }, worker),
    );
  }, [users]);

  return useMemo(
    () => (users ? withFetchedProfiles(users, fetched) : null),
    [users, fetched],
  );
}
