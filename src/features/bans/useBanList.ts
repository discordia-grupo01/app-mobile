import { type Ban, type UnbanMemberResult } from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { useProfileFallback } from "../../hooks/useProfileFallback";
import { listBans, unbanMember } from "./api";

interface LoadState {
  bans: Ban[] | null;
  errorMessage: string;
}

/**
 * Lista completa de baneados de un servidor, cada uno con el perfil que el
 * back adjunta (solo si falta se pide `GET /users/:id`). `bans` es `null`
 * mientras carga por primera vez; `reload` vuelve a pedir sin vaciar la lista.
 * La busqueda y la paginacion las hace quien lo usa.
 */
export function useBanList(serverId: string) {
  const [state, setState] = useState<LoadState>({
    bans: null,
    errorMessage: "",
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listBans(serverId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { bans: result.bans, errorMessage: "" }
          : { bans: [], errorMessage: result.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [serverId, version]);

  const unban = useCallback(
    async (userId: string): Promise<UnbanMemberResult> => {
      const result = await unbanMember(serverId, userId);
      if (result.ok) {
        setState((prev) => ({
          ...prev,
          bans: prev.bans?.filter((ban) => ban.user_id !== userId) ?? null,
        }));
      }
      return result;
    },
    [serverId],
  );

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    bans: useProfileFallback(state.bans),
    errorMessage: state.errorMessage,
    unban,
    reload,
  };
}
