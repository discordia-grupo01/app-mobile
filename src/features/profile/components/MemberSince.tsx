import { formatMemberSince } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

export function MemberSince({ isoDate }: { isoDate: string }) {
  const colors = useThemeColors();
  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        MIEMBRO DESDE
      </Text>
      <View className="flex-row items-center gap-2">
        <Feather name="calendar" size={14} color={colors.textSubtle} />
        <Text className="text-[13px] text-content-muted">
          {formatMemberSince(isoDate)}
        </Text>
      </View>
    </View>
  );
}
