import {
  BANS_EMPTY,
  BANS_EMPTY_SEARCH,
  BANS_MEMBERS_EMPTY,
  BANS_MEMBERS_EMPTY_SEARCH,
  banListItems,
  filterByDisplayName,
  memberListItems,
  type UserListItem,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";

import { usePagination } from "../../hooks/usePagination";
import { type BansTab } from "./types";
import { useBanCandidates } from "./useBanCandidates";
import { useBanList } from "./useBanList";

interface UseBansListViewOptions {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
}

/**
 * Lo que muestra el modal de moderacion: la pestaña activa (baneados o
 * miembros), su busqueda por nombre y la pagina actual. Los baneados se buscan
 * y paginan en memoria (el back no los filtra por nombre); los miembros los
 * busca y pagina el back, y recien se piden al abrir su pestaña.
 */
export function useBansListView({
  serverId,
  ownerId,
  currentUserId,
}: UseBansListViewOptions) {
  const [tab, setTab] = useState<BansTab>("bans");
  const [hasOpenedMembers, setHasOpenedMembers] = useState(false);
  const [search, setSearch] = useState("");

  const banList = useBanList(serverId);
  const candidates = useBanCandidates({
    serverId,
    ownerId,
    currentUserId,
    search,
    enabled: hasOpenedMembers,
  });

  const isBans = tab === "bans";
  const isSearching = search.trim() !== "";

  const banItems = useMemo<UserListItem[] | null>(
    () => banList.bans && banListItems(banList.bans),
    [banList.bans],
  );
  const banMatches = useMemo(
    () => filterByDisplayName(banItems ?? [], search),
    [banItems, search],
  );
  const banPagination = usePagination(banMatches);

  const memberItems = useMemo<UserListItem[] | null>(
    () => candidates.candidates && memberListItems(candidates.candidates),
    [candidates.candidates],
  );

  // Lo que dibuja la pestaña activa, venga de memoria o del back.
  const items = isBans ? banItems : memberItems;
  const pagination = isBans
    ? banPagination
    : {
        pageItems: memberItems ?? [],
        page: candidates.page,
        pageCount: candidates.pageCount,
        total: candidates.total,
        range: candidates.range,
        setPage: candidates.setPage,
      };

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
    banPagination.resetPage();
  }

  function changeSearch(value: string) {
    setSearch(value);
    banPagination.resetPage();
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
    errorMessage: isBans ? banList.errorMessage : candidates.errorMessage,
    items,
    /** Solo para baneados: la busqueda de miembros la resume la paginacion. */
    matchCount: isBans ? banMatches.length : null,
    bansCount: banList.bans?.length ?? 0,
    pagination,
    unban: banList.unban,
    changeTab,
    changeSearch,
    reload,
  };
}
