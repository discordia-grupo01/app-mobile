import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useAuth } from "../auth/auth-context";
import { useBlockedUsers } from "./useBlockedUsers";

type BlockedUsersValue = ReturnType<typeof useBlockedUsers>;

const BlockedUsersContext = createContext<BlockedUsersValue | null>(null);

export function BlockedUsersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { blockedIds, blockUser, unblockUser } = useBlockedUsers(
    user ? String(user.id) : null,
  );
  const value = useMemo(
    () => ({ blockedIds, blockUser, unblockUser }),
    [blockedIds, blockUser, unblockUser],
  );

  return (
    <BlockedUsersContext.Provider value={value}>
      {children}
    </BlockedUsersContext.Provider>
  );
}

export function useBlockedUsersContext(): BlockedUsersValue {
  const value = useContext(BlockedUsersContext);
  if (!value) {
    throw new Error(
      "useBlockedUsersContext debe usarse dentro de <BlockedUsersProvider>",
    );
  }
  return value;
}
