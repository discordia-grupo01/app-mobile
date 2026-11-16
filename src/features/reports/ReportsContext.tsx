import { createContext, useContext } from "react";

export interface PendingReportsValue {
  byServer: Record<string, number>;
  refresh: (serverId?: string) => Promise<void>;
}

const PendingReportsContext = createContext<PendingReportsValue | null>(null);

export const PendingReportsProvider = PendingReportsContext.Provider;

export function usePendingReportsContext(): PendingReportsValue | null {
  return useContext(PendingReportsContext);
}

export function pendingReportsOf(
  value: PendingReportsValue | null,
  serverId: string,
): number {
  return value?.byServer[serverId] ?? 0;
}
