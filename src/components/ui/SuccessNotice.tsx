import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";

interface SuccessNoticeProps {
  message: string;
}

/** Aviso de exito, el espejo verde de `FormErrorBanner`. */
export function SuccessNotice({ message }: SuccessNoticeProps) {
  const colors = useThemeColors();

  return (
    <View
      className="flex-row items-start gap-3 rounded-xl px-4 py-3"
      style={{ backgroundColor: withAlpha(colors.success, 0.12) }}
      accessibilityRole="alert"
    >
      <Feather name="check" size={16} color={colors.success} />
      <Text className="flex-1 text-[13px] leading-[19px] text-success">
        {message}
      </Text>
    </View>
  );
}
