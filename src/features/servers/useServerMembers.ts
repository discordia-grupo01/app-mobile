import { collectAllPages, type Member } from "@discordia/client-shared";

import { useEffect, useState } from "react";

import { useProfileFallback } from "../../hooks/useProfileFallback";
import { listMembers } from "./api/members";

/** Tamaño de pagina: el maximo que acepta el back. */
const PAGE_SIZE = 100;

/**
 * Todos los miembros del servidor (se juntan las paginas del back) con el
 * perfil completado cuando todavia no se replico. `null` mientras carga; si
 * falla queda en `[]`, asi lo que depende de la lista sigue andando con lo que
 * tenga.
 */
export function useServerMembers(serverId: string): Member[] | null {
  const [loaded, setLoaded] = useState<Member[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    collectAllPages<Member>(async (offset) => {
      const result = await listMembers(serverId, {
        limit: PAGE_SIZE,
        offset,
      });
      return result.ok
        ? {
            ok: true,
            status: 200,
            data: { items: result.members, total: result.total },
          }
        : {
            ok: false,
            status: 0,
            code: "MEMBERS_LOAD_FAILED",
            message: result.message,
          };
    }).then((result) => {
      if (!cancelled) setLoaded(result.ok ? result.data.items : []);
    });
    return () => {
      cancelled = true;
    };
  }, [serverId]);

  return useProfileFallback(loaded);
}
