import { type ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";

export interface UserRowAction {
  label: string;
  onPress: () => void;
  /** `danger` para las acciones destructivas (banear). */
  tone?: "default" | "danger";
  isLoading?: boolean;
  /**
   * Muestra solo este icono (el `label` queda como etiqueta de accesibilidad).
   * Mide siempre lo mismo, asi no le quita lugar al nombre en pantallas
   * angostas o con la letra agrandada.
   */
  icon?: ReactNode;
}

interface RowActionButtonProps {
  action: UserRowAction;
  isDisabled: boolean;
}

/** Boton compacto de una fila de usuario: nunca crece mas de lo que necesita. */
export function RowActionButton({ action, isDisabled }: RowActionButtonProps) {
  const colors = useThemeColors();
  const isInert = isDisabled || action.isLoading;
  const isDanger = action.tone === "danger";

  return (
    <TouchableOpacity
      onPress={action.onPress}
      disabled={isInert}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      className={cn(
        "h-10 items-center justify-center rounded-xl border border-line bg-surface-input",
        action.icon ? "w-10" : "px-3",
        isInert && "opacity-50",
      )}
    >
      {action.isLoading ? (
        <ActivityIndicator
          size="small"
          color={isDanger ? colors.danger : colors.accentBright}
        />
      ) : (
        (action.icon ?? (
          <Text
            numberOfLines={1}
            className={cn(
              "text-xs font-bold",
              isDanger ? "text-danger" : "text-accent-strong",
            )}
          >
            {action.label}
          </Text>
        ))
      )}
    </TouchableOpacity>
  );
}
