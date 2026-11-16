import {
  CHANGE_COALESCE_MS,
  type ChangeFilter,
  watchChanges,
} from "@discordia/client-shared";

import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { changeBus } from "../lib/changeBus";

interface RefreshOnChangeOptions {
  enabled?: boolean;
  pollMs?: number | null;
  delayMs?: number;
}

export function useRefreshOnChange(
  filter: ChangeFilter,
  refresh: () => void | Promise<unknown>,
  {
    enabled = true,
    pollMs = null,
    delayMs = CHANGE_COALESCE_MS,
  }: RefreshOnChangeOptions = {},
) {
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const resourcesKey = filter.resources.join(",");
  const kindsKey = filter.kinds?.join(",") ?? "";
  const { serverId, userId } = filter;

  useEffect(() => {
    if (!enabled) return;
    return watchChanges({
      bus: changeBus,
      filter: {
        resources: resourcesKey
          ? (resourcesKey.split(",") as ChangeFilter["resources"])
          : [],
        serverId,
        userId,
        kinds: kindsKey
          ? (kindsKey.split(",") as ChangeFilter["kinds"])
          : undefined,
      },
      refresh: () => refreshRef.current(),
      delayMs,
      pollMs,
      isActive: () => AppState.currentState === "active",
      onActivate: (listener) => {
        const subscription = AppState.addEventListener("change", listener);
        return () => subscription.remove();
      },
    });
  }, [enabled, pollMs, delayMs, resourcesKey, kindsKey, serverId, userId]);
}
