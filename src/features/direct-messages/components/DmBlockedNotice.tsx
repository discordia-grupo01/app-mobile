import { DM_BLOCKED_CANNOT_SEND } from "@discordia/client-shared";

import { Text } from "react-native";

/** Aviso sobre el composer cuando el usuario bloqueo al otro. */
export function DmBlockedNotice() {
  return (
    <Text className="mx-3 mb-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-[13px] text-danger">
      {DM_BLOCKED_CANNOT_SEND}
    </Text>
  );
}
