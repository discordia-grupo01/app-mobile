import {
  BOOSTED_SERVERS_PAGE_SIZE,
  type BoostedServersPage,
} from "@discordia/client-shared";

import { useOffsetPages } from "../../../../hooks/useOffsetPages";
import { listBoostedServersPage } from "../../../boosts/api";

const countServers = (page: BoostedServersPage) => page.servers.length;

export function useBoostedServersPage() {
  return useOffsetPages({
    fetchPage: listBoostedServersPage,
    countOf: countServers,
    pageSize: BOOSTED_SERVERS_PAGE_SIZE,
    refreshOn: { resources: ["boosts"] },
  });
}
