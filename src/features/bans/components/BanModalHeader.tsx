import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";

interface BanModalHeaderProps {
  title: string;
  subtitle: string;
}

/** Encabezado de los modales de moderacion: icono, titulo y subtitulo. */
export function BanModalHeader({ title, subtitle }: BanModalHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="shrink-0 flex-row items-center gap-3 border-b border-line px-5 py-5 pr-16">
      <View
        className="size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: withAlpha(colors.danger, 0.15) }}
      >
        <Feather name="shield-off" size={19} color={colors.danger} />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          accessibilityRole="header"
          className="text-[17px] font-bold leading-tight text-content"
        >
          {title}
        </Text>
        <Text className="text-xs text-content-muted">{subtitle}</Text>
      </View>
    </View>
  );
}
