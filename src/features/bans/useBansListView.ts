import {
  BANS_EMPTY,
  BANS_EMPTY_SEARCH,
  BANS_MEMBERS_EMPTY,
  BANS_MEMBERS_EMPTY_SEARCH,
  banListItems,
  memberListItems,
  type UserListItem,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";

import { type BansTab } from "./types";
import { useBanCandidates } from "./useBanCandidates";
import { useBanList } from "./useBanList";

interface UseBansListViewOptions {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
}

/**
 * Lo que muestra Baneos: la lista de baneados o la eleccion del miembro a
 * banear, cada una con su busqueda por nombre. Las dos listas las busca el
 * back; los miembros recien se piden al abrir la eleccion.
 */
export function useBansListView({
  serverId,
  ownerId,
  currentUserId,
}: UseBansListViewOptions) {
  const [tab, setTab] = useState<BansTab>("bans");
  const [hasOpenedMembers, setHasOpenedMembers] = useState(false);
  const [search, setSearch] = useState("");

  const isBans = tab === "bans";
  const banList = useBanList(serverId, isBans ? search : "");
  const candidates = useBanCandidates({
    serverId,
    ownerId,
    currentUserId,
    search: isBans ? "" : search,
    enabled: hasOpenedMembers,
  });

  const isSearching = search.trim() !== "";

  const banItems = useMemo<UserListItem[] | null>(
    () => banList.bans && banListItems(banList.bans),
    [banList.bans],
  );
  const memberItems = useMemo<UserListItem[] | null>(
    () => candidates.candidates && memberListItems(candidates.candidates),
    [candidates.candidates],
  );

  const list = isBans ? banList : candidates;

  const emptyMessage = isBans
    ? isSearching
      ? BANS_EMPTY_SEARCH
      : BANS_EMPTY
    : isSearching
      ? BANS_MEMBERS_EMPTY_SEARCH
      : BANS_MEMBERS_EMPTY;

  function changeTab(next: BansTab) {
    setTab(next);
    if (next === "members") setHasOpenedMembers(true);
    setSearch("");
  }

  function reload() {
    banList.reload();
    candidates.reload();
  }

  return {
    tab,
    isBans,
    search,
    isSearching,
    noun: isBans ? "baneados" : "miembros",
    emptyMessage,
    errorMessage: list.errorMessage,
    items: isBans ? banItems : memberItems,
    /** El total sin la busqueda; de los miembros solo se sabe si no se busca. */
    count: isBans
      ? banList.allTotal
      : isSearching
        ? undefined
        : candidates.candidatesTotal,
    /** Coincidencias de la busqueda en la lista que se ve. */
    matches: list.total,
    page: list.page,
    pageCount: list.pageCount,
    range: list.range,
    setPage: list.setPage,
    unban: banList.unban,
    changeTab,
    changeSearch: setSearch,
    reload,
  };
}
