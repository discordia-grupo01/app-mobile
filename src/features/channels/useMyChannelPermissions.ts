import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { getMemberChannelPermissions } from "../servers/api";

export type MyChannelPermissions =
  | { status: "loading" }
  | { status: "loaded"; permissions: readonly string[] }
  | { status: "unknown" };

export function useMyChannelPermissions(
  channelId: string | null,
  userId: string | null,
  refreshKey = 0,
): MyChannelPermissions {
  const [loaded, setLoaded] = useState<{
    channelId: string;
    permissions: string[] | null;
  } | null>(null);
  const [foregroundCount, setForegroundCount] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setForegroundCount((count) => count + 1);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!channelId || !userId) return;
    let cancelled = false;
    getMemberChannelPermissions(channelId, userId).then((result) => {
      if (cancelled) return;
      setLoaded((current) => {
        if (result.ok) return { channelId, permissions: result.permissions };
        // Un fallo al refrescar no borra lo que ya sabiamos de este canal.
        if (current?.channelId === channelId) return current;
        return { channelId, permissions: null };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, userId, refreshKey, foregroundCount]);

  if (!channelId || !userId) return { status: "unknown" };
  if (loaded?.channelId !== channelId) return { status: "loading" };
  return loaded.permissions
    ? { status: "loaded", permissions: loaded.permissions }
    : { status: "unknown" };
}
