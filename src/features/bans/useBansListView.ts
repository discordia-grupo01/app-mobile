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
 * Lo que muestra el modal de moderacion: la pestaña activa (baneados o
 * miembros), su busqueda por nombre y la pagina actual. Las dos listas las
 * busca y pagina el back; los miembros recien se piden al abrir su pestaña.
 */
export function useBansListView({
  serverId,
  ownerId,
  currentUserId,
}: UseBansListViewOptions) {
  const [tab, setTab] = useState<BansTab>("bans");
  const [hasOpenedMembers, setHasOpenedMembers] = useState(false);
  const [search, setSearch] = useState("");

  const banList = useBanList(serverId, tab === "bans" ? search : "");
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
  const memberItems = useMemo<UserListItem[] | null>(
    () => candidates.candidates && memberListItems(candidates.candidates),
    [candidates.candidates],
  );

  const items = isBans ? banItems : memberItems;
  const pages = isBans ? banList : candidates;
  const pagination = {
    page: pages.page,
    pageCount: pages.pageCount,
    total: pages.total,
    range: pages.range,
    setPage: pages.setPage,
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
    /** Total de baneados sin la busqueda, para la pestaña y el resumen. */
    bansCount: banList.allTotal,
    pagination,
    unban: banList.unban,
    changeTab,
    changeSearch: setSearch,
    reload,
  };
}
