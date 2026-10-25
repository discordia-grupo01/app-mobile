import { loadPresence, type PresenceStore } from "@discordia/client-shared";
import { useEffect } from "react";

import { listPresence } from "./api";
import { usePresenceSelector } from "./PresenceContext";

export function useLoadPresence(
  store: PresenceStore,
  userIds: readonly string[],
) {
  const joins = usePresenceSelector(store, (state) => state.userRoomJoins);
  const key = [...new Set(userIds)].sort().join(",");

  useEffect(() => {
    if (!key) return;
    void loadPresence(store, key.split(","), listPresence);
  }, [store, key, joins]);
}
