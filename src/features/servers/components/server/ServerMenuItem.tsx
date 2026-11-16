import { Feather } from "@expo/vector-icons";
import { type ReactElement, type ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ServerMenuItemProps {
  /** Nombre de un icono de Feather, o un icono propio ya dibujado. */
  icon: keyof typeof Feather.glyphMap | ReactElement;
  label: string;
  onPress: () => void;
  /** `danger` para las acciones destructivas (abandonar el servidor). */
  tone?: "default" | "danger";
  trailing?: ReactNode;
}

/** Una fila del menu desplegable del servidor. */
export function ServerMenuItem({
  icon,
  label,
  onPress,
  tone = "default",
  trailing,
}: ServerMenuItemProps) {
  const colors = useThemeColors();
  const isDanger = tone === "danger";
  const iconColor = isDanger ? colors.danger : colors.info;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center gap-2.5 rounded-lg mx-1 px-2.5 py-3"
      onPress={onPress}
    >
      {typeof icon === "string" ? (
        <Feather name={icon} size={16} color={iconColor} />
      ) : (
        icon
      )}
      <Text
        className={cn(
          "flex-1 text-[14px] font-semibold",
          isDanger ? "text-danger" : "text-content",
        )}
      >
        {label}
      </Text>
      {trailing}
    </TouchableOpacity>
  );
}
