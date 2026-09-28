import { Text, View } from "react-native";

import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";

interface FormErrorBannerProps {
  message?: string | null;
}

/** Error general de un formulario, igual al `FormAlert` de web-client. */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
  const colors = useThemeColors();
  if (!message) return null;

  return (
    <View
      className="mb-[18px] rounded-lg border p-3"
      style={{
        borderColor: withAlpha(colors.danger, 0.3),
        backgroundColor: withAlpha(colors.danger, 0.12),
      }}
      accessibilityRole="alert"
    >
      <Text className="text-center text-[13px] text-danger">{message}</Text>
    </View>
  );
}
