import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ServerMenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  /** `danger` para las acciones destructivas (abandonar el servidor). */
  tone?: "default" | "danger";
}

/** Una fila del menu desplegable del servidor. */
export function ServerMenuItem({
  icon,
  label,
  onPress,
  tone = "default",
}: ServerMenuItemProps) {
  const colors = useThemeColors();
  const isDanger = tone === "danger";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={16}
        color={isDanger ? colors.danger : colors.info}
      />
      <Text
        className={cn(
          "text-[14px] font-semibold",
          isDanger ? "text-danger" : "text-content",
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
