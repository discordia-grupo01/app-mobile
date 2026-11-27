import {
  BAN_ACTION_LABEL,
  BAN_REVOKE_LABEL,
  displayNameOf,
  type UnbanMemberResult,
  unbanSuccessNotice,
  type UserListItem,
} from "@discordia/client-shared";

import { useState } from "react";

import { avatarUriOf } from "../../lib/userProfile";
import { type UserRowAction } from "./components/RowActionButton";
import { type BanTarget } from "./types";

interface UseBanRowActionsOptions {
  isBans: boolean;
  unban: (userId: string) => Promise<UnbanMemberResult>;
  showToast: (message: string) => void;
}

/** Revocar desde la lista de baneados, o elegir a quien banear desde la de miembros. */
export function useBanRowActions({
  isBans,
  unban,
  showToast,
}: UseBanRowActionsOptions) {
  const [revokeError, setRevokeError] = useState("");
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<BanTarget | null>(null);

  async function revoke({ userId, profile }: UserListItem) {
    setRevokeError("");
    setRevokingUserId(userId);
    const result = await unban(userId);
    setRevokingUserId(null);
    if (!result.ok) {
      setRevokeError(result.message);
      return;
    }
    showToast(unbanSuccessNotice(displayNameOf(profile)));
  }

  function actionsFor(item: UserListItem): UserRowAction[] {
    const { userId, profile } = item;
    if (isBans) {
      return [
        {
          label: BAN_REVOKE_LABEL,
          isLoading: revokingUserId === userId,
          onPress: () => revoke(item),
        },
      ];
    }
    return [
      {
        label: BAN_ACTION_LABEL,
        tone: "danger",
        onPress: () =>
          setBanTarget({
            userId,
            name: displayNameOf(profile),
            avatarUri: avatarUriOf(profile),
          }),
      },
    ];
  }

  return {
    actionsFor,
    revokeError,
    clearRevokeError: () => setRevokeError(""),
    isRevoking: revokingUserId !== null,
    banTarget,
    clearBanTarget: () => setBanTarget(null),
  };
}
