import {
  eligibleBanCandidates,
  type MemberPageQuery,
} from "@discordia/client-shared";

import { useCallback, useMemo } from "react";

import { useMemberPages } from "../../hooks/useMemberPages";
import { listMembers } from "../servers/api";

interface UseBanCandidatesOptions {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  search: string;
  /** No pide nada hasta que la pestaña se abre por primera vez. */
  enabled: boolean;
}

/**
 * Miembros que se pueden ofrecer para banear (ver `eligibleBanCandidates`),
 * de a una pagina del back. El propietario y uno mismo se sacan de la pagina,
 * asi que esa pagina muestra uno menos.
 */
export function useBanCandidates({
  serverId,
  ownerId,
  currentUserId,
  search,
  enabled,
}: UseBanCandidatesOptions) {
  const fetchPage = useCallback(
    (query: MemberPageQuery) => listMembers(serverId, query),
    [serverId],
  );
  const pages = useMemberPages({ fetchPage, search, enabled });

  const candidates = useMemo(
    () =>
      pages.members
        ? eligibleBanCandidates(pages.members, ownerId, currentUserId)
        : null,
    [pages.members, ownerId, currentUserId],
  );

  return { ...pages, candidates };
}
