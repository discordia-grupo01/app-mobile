import {
  SERVER_SUSPENDED_HINT,
  SERVER_SUSPENDED_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";

export function ServerSuspendedNotice() {
  const colors = useThemeColors();

  return (
    <View
      accessibilityRole="alert"
      className="flex-1 items-center justify-center gap-3 px-6"
    >
      <View className="size-14 items-center justify-center rounded-2xl bg-surface-input">
        <Feather name="slash" size={26} color={colors.text} />
      </View>
      <View className="max-w-xs items-center gap-1">
        <Text className="text-center text-[14px] font-medium text-content">
          {SERVER_SUSPENDED_TITLE}
        </Text>
        <Text className="text-center text-[12px] text-content-muted">
          {SERVER_SUSPENDED_HINT}
        </Text>
      </View>
    </View>
  );
}
