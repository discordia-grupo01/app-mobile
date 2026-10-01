import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";

export interface UserRowAction {
  label: string;
  onPress: () => void;
  /** `danger` para las acciones destructivas (banear). */
  tone?: "default" | "danger";
  isLoading?: boolean;
}

interface RowActionButtonProps {
  action: UserRowAction;
  isDisabled: boolean;
}

/** Boton compacto de una fila de usuario. */
export function RowActionButton({ action, isDisabled }: RowActionButtonProps) {
  const colors = useThemeColors();
  const isInert = isDisabled || action.isLoading;
  const isDanger = action.tone === "danger";

  return (
    <TouchableOpacity
      onPress={action.onPress}
      disabled={isInert}
      accessibilityRole="button"
      className={cn(
        "min-h-9 min-w-16 items-center justify-center rounded-xl border border-line bg-surface-input px-3 py-2",
        isInert && "opacity-50",
      )}
    >
      {action.isLoading ? (
        <ActivityIndicator
          size="small"
          color={isDanger ? colors.danger : colors.accentBright}
        />
      ) : (
        <Text
          numberOfLines={1}
          className={cn(
            "text-xs font-bold",
            isDanger ? "text-danger" : "text-accent-strong",
          )}
        >
          {action.label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
