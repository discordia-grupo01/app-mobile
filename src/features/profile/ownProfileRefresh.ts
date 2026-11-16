import type { AppStateStatus } from "react-native";

export const OWN_PROFILE_FOREGROUND_REFRESH_MS = 60_000;

export function shouldRefreshOnForeground(
  state: AppStateStatus,
  lastFetchAt: number,
  now: number,
): boolean {
  return (
    state === "active" && now - lastFetchAt >= OWN_PROFILE_FOREGROUND_REFRESH_MS
  );
}
