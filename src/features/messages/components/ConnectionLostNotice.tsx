import {
  CHAT_OFFLINE_BAR_MOBILE,
  CHAT_OFFLINE_HINT_MOBILE,
  CHAT_OFFLINE_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface ConnectionLostNoticeProps {
  /** `panel` ocupa el lugar de la lista de mensajes; `bar` va sobre el composer. */
  variant: "panel" | "bar";
}

/** Aviso de que se agotaron los reintentos de conexion del chat. */
export function ConnectionLostNotice({ variant }: ConnectionLostNoticeProps) {
  const colors = useThemeColors();

  if (variant === "bar") {
    return (
      <View
        accessibilityRole="alert"
        className="flex-row items-center justify-center gap-2 bg-danger/10 px-4 py-1"
      >
        <Feather name="wifi-off" size={13} color={colors.danger} />
        <Text className="text-[12px] text-danger">
          {CHAT_OFFLINE_BAR_MOBILE}
        </Text>
      </View>
    );
  }
  return (
    <View
      accessibilityRole="alert"
      className="flex-1 items-center justify-center gap-3 px-6"
    >
      <View className="size-14 items-center justify-center rounded-2xl bg-danger/10">
        <Feather name="wifi-off" size={26} color={colors.danger} />
      </View>
      <View className="max-w-xs items-center gap-1">
        <Text className="text-center text-[14px] font-medium text-content">
          {CHAT_OFFLINE_TITLE}
        </Text>
        <Text className="text-center text-[12px] text-content-muted">
          {CHAT_OFFLINE_HINT_MOBILE}
        </Text>
      </View>
    </View>
  );
}
