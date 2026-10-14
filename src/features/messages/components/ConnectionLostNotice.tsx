import { CHAT_OFFLINE_NOTICE_MOBILE } from "@discordia/client-shared";

import { Text } from "react-native";

/** Barra sobre el composer cuando se agotaron los reintentos de conexion. */
export function ConnectionLostNotice() {
  return (
    <Text
      accessibilityRole="alert"
      className="bg-danger/10 px-4 py-1 text-center text-[12px] text-danger"
    >
      {CHAT_OFFLINE_NOTICE_MOBILE}
    </Text>
  );
}
