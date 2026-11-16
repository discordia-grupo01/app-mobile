import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { useAuth } from "../auth/auth-context";
import { shouldRefreshOnForeground } from "./ownProfileRefresh";
import { getOwnProfile } from "./service";

export function useOwnProfileSync() {
  const { token, user, updateUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const lastFetchAt = useRef(0);
  const isMounted = useRef(true);

  const refresh = useCallback(async () => {
    lastFetchAt.current = Date.now();
    const result = await getOwnProfile();
    if (!isMounted.current) return;
    if (result.ok) updateUser(result.user);
    setIsLoaded(true);
  }, [updateUser]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (token) void refresh();
  }, [token, refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (shouldRefreshOnForeground(state, lastFetchAt.current, Date.now())) {
        void refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  useRefreshOnChange(
    { resources: ["profile"], userId: user ? String(user.id) : null },
    refresh,
    { enabled: Boolean(token), pollMs: null },
  );

  return { isLoaded, refresh };
}
