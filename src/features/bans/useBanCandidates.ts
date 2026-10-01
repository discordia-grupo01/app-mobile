import {
  eligibleBanCandidates,
  type Member,
  MEMBER_PAGE_LIMIT,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useProfileFallback } from "../../hooks/useProfileFallback";
import { listMembers } from "../servers/api";

interface UseBanCandidatesOptions {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  /** No pide nada hasta que la pestaña se abre por primera vez. */
  enabled: boolean;
}

interface LoadState {
  members: Member[] | null;
  errorMessage: string;
}

/** Miembros que se pueden ofrecer para banear (ver `eligibleBanCandidates`). */
export function useBanCandidates({
  serverId,
  ownerId,
  currentUserId,
  enabled,
}: UseBanCandidatesOptions) {
  const [state, setState] = useState<LoadState>({
    members: null,
    errorMessage: "",
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    listMembers(serverId, { limit: MEMBER_PAGE_LIMIT }).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { members: result.members, errorMessage: "" }
          : { members: [], errorMessage: result.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [serverId, enabled, version]);

  const eligible = useMemo(
    () =>
      state.members
        ? eligibleBanCandidates(state.members, ownerId, currentUserId)
        : null,
    [state.members, ownerId, currentUserId],
  );

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    candidates: useProfileFallback(eligible),
    errorMessage: state.errorMessage,
    reload,
  };
}
