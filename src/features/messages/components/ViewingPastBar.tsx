import { JUMP_TO_PRESENT_LABEL } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { FloatingPill, PILL_CLASS } from "./FloatingPill";

export function ViewingPastBar({
  onJumpToPresent,
}: {
  onJumpToPresent: () => void;
}) {
  const colors = useThemeColors();

  return (
    <FloatingPill position="bottom">
      <TouchableOpacity
        onPress={onJumpToPresent}
        accessibilityRole="button"
        className={PILL_CLASS}
      >
        <Text className="text-[12px] font-semibold text-accent-strong">
          {JUMP_TO_PRESENT_LABEL}
        </Text>
        <Feather name="arrow-down" size={13} color={colors.accentBright} />
      </TouchableOpacity>
    </FloatingPill>
  );
}
