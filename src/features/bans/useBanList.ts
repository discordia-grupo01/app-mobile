import {
  type Ban,
  type MemberPageQuery,
  type UnbanMemberResult,
} from "@discordia/client-shared";

import { useCallback, useState } from "react";

import { usePagedList } from "../../hooks/usePagedList";
import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { listBans, unbanMember } from "./api";

/**
 * Los baneados de un servidor, filtrados por nombre y paginados en el back. Cada uno trae el perfil del usuario (el del baneo, o
 * `GET /users/:id` si todavia no se replico).
 */
export function useBanList(serverId: string, search: string) {
  const fetchPage = useCallback(
    async (query: MemberPageQuery) => {
      const result = await listBans(serverId, query);
      return result.ok
        ? { ok: true as const, items: result.bans, total: result.total }
        : result;
    },
    [serverId],
  );
  const list = usePagedList<Ban>({ fetchPage, search });
  const { total, isSearching, reload } = list;

  // El total del encabezado es el de todos los baneados, no el de la busqueda.
  const [allTotal, setAllTotal] = useState(0);
  if (!isSearching && allTotal !== total) setAllTotal(total);

  useRefreshOnChange({ resources: ["moderation"], serverId }, reload);

  const unban = useCallback(
    async (userId: string): Promise<UnbanMemberResult> => {
      const result = await unbanMember(serverId, userId);
      if (result.ok) reload();
      return result;
    },
    [serverId, reload],
  );

  return { ...list, bans: list.items, allTotal, unban };
}
