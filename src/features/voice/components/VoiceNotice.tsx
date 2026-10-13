import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";

/** Aviso de la llamada: por que se corto, o que pasa con el mic. */
export function VoiceNotice({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View
      className="flex-row items-center gap-2 rounded-lg border px-3 py-2.5"
      style={{
        borderColor: withAlpha(colors.danger, 0.3),
        backgroundColor: withAlpha(colors.danger, 0.12),
      }}
      accessibilityRole="alert"
    >
      <Text className="flex-1 text-[13px] leading-[18px] text-danger">
        {message}
      </Text>
      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
        >
          <Feather name="x" size={15} color={colors.danger} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
