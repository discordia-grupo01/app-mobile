import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";

interface ModalCloseButtonProps {
  onPress: () => void;
  /** `filled` (con borde, sobre formularios) o `subtle` (translucido, sobre carteles). */
  variant?: "filled" | "subtle";
}

/** La "x" de la esquina de un `ModalShell`. */
export function ModalCloseButton({
  onPress,
  variant = "filled",
}: ModalCloseButtonProps) {
  const colors = useThemeColors();
  const isFilled = variant === "filled";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "absolute z-10 h-8 w-8 items-center justify-center rounded-2xl",
        isFilled
          ? "top-4 right-4 border border-line bg-surface-input"
          : "top-3 right-3 bg-[rgba(255,255,255,0.06)]",
      )}
      accessibilityRole="button"
      accessibilityLabel="Cerrar"
    >
      <Feather
        name="x"
        size={isFilled ? 13 : 16}
        color={isFilled ? colors.textSubtle : colors.textMuted}
      />
    </TouchableOpacity>
  );
}
