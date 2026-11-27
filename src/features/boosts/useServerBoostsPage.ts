import { DEFAULT_PAGE_SIZE, type BoostPage } from "@discordia/client-shared";

import { useCallback } from "react";

import { useOffsetPages } from "../../hooks/useOffsetPages";
import { listServerBoostsPage } from "./api";

const countBoosts = (page: BoostPage) => page.boosts.length;

export function useServerBoostsPage(serverId: string) {
  const fetchPage = useCallback(
    (page: number) => listServerBoostsPage(serverId, page),
    [serverId],
  );
  return useOffsetPages({
    fetchPage,
    countOf: countBoosts,
    pageSize: DEFAULT_PAGE_SIZE,
    refreshOn: { resources: ["boosts"] },
  });
}

export type ServerBoostsPage = ReturnType<typeof useServerBoostsPage>;
