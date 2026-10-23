import { BLOCK_USER_LABEL, UNBLOCK_USER_LABEL } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface BlockUserActionProps {
  isBlocked: boolean;
  onPress: () => void;
}

export function BlockUserAction({ isBlocked, onPress }: BlockUserActionProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-11 flex-row items-center gap-2.5 rounded-xl border border-line bg-surface-input px-3.5 py-2.5"
    >
      <Feather
        name={isBlocked ? "shield" : "slash"}
        size={16}
        color={colors.danger}
      />
      <Text className="text-[14px] font-semibold text-danger">
        {isBlocked ? UNBLOCK_USER_LABEL : BLOCK_USER_LABEL}
      </Text>
    </TouchableOpacity>
  );
}
