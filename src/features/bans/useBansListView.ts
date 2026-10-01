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
 * miembros), su busqueda por nombre y la pagina actual. Los miembros recien se
 * piden la primera vez que se abre su pestaña.
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
    enabled: hasOpenedMembers,
  });

  const isBans = tab === "bans";
  const isSearching = search.trim() !== "";

  const items = useMemo<UserListItem[] | null>(() => {
    if (isBans) return banList.bans && banListItems(banList.bans);
    return candidates.candidates && memberListItems(candidates.candidates);
  }, [isBans, banList.bans, candidates.candidates]);

  const matches = useMemo(
    () => filterByDisplayName(items ?? [], search),
    [items, search],
  );
  const pagination = usePagination(matches);

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
    pagination.resetPage();
  }

  function changeSearch(value: string) {
    setSearch(value);
    pagination.resetPage();
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
    matchCount: matches.length,
    bansCount: banList.bans?.length ?? 0,
    pagination,
    unban: banList.unban,
    changeTab,
    changeSearch,
    reload,
  };
}
