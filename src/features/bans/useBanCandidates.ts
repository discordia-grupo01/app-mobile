import {
  eligibleBanCandidates,
  type Member,
  type MemberPageQuery,
} from "@discordia/client-shared";

import { useCallback, useMemo } from "react";

import { listMembers } from "../servers/api";
import { useLoadMoreList } from "./useLoadMoreList";

interface UseBanCandidatesOptions {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  search: string;
  /** No pide nada hasta que se abre la eleccion por primera vez. */
  enabled: boolean;
}

/**
 * Miembros que se pueden ofrecer para banear (ver `eligibleBanCandidates`),
 * cargados de a una pagina. El propietario y uno mismo se sacan de lo
 * cargado, asi que esa pagina muestra uno menos.
 */
export function useBanCandidates({
  serverId,
  ownerId,
  currentUserId,
  search,
  enabled,
}: UseBanCandidatesOptions) {
  const fetchPage = useCallback(
    async (query: MemberPageQuery) => {
      const result = await listMembers(serverId, query);
      return result.ok
        ? { ok: true as const, items: result.members, total: result.total }
        : result;
    },
    [serverId],
  );
  const list = useLoadMoreList<Member>({ fetchPage, search, enabled });

  const candidates = useMemo(
    () =>
      list.items
        ? eligibleBanCandidates(list.items, ownerId, currentUserId)
        : null,
    [list.items, ownerId, currentUserId],
  );

  // El back cuenta al propietario y a uno mismo, que siempre son miembros.
  const excluded = currentUserId && currentUserId !== ownerId ? 2 : 1;

  return {
    ...list,
    candidates,
    candidatesTotal: Math.max(0, list.total - excluded),
  };
}
