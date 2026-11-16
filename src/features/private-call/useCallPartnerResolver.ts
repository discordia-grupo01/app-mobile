import {
  type PrivateCallPartner,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import { useCallback } from "react";

import { avatarUriOf } from "../../lib/userProfile";
import { getPublicProfile } from "../profile/service";

export function useCallPartnerResolver(): (
  userId: string,
) => Promise<PrivateCallPartner> {
  return useCallback(async (userId: string) => {
    const result = await getPublicProfile(userId);
    if (!result.ok) {
      return { id: userId, name: UNKNOWN_USER_NAME, avatarUrl: null };
    }
    return {
      id: userId,
      name: result.user.name,
      avatarUrl: avatarUriOf(result.user),
    };
  }, []);
}
