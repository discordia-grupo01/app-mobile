import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { getMemberChannelPermissions } from "../servers/api";

export function useMyChannelPermissions(
  channelId: string | null,
  userId: string | null,
  refreshKey = 0,
): string[] | null {
  const [loaded, setLoaded] = useState<{
    channelId: string;
    permissions: string[];
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
      if (cancelled || !result.ok) return;
      setLoaded({ channelId, permissions: result.permissions });
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, userId, refreshKey, foregroundCount]);

  return loaded && loaded.channelId === channelId ? loaded.permissions : null;
}
