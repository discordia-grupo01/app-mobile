import { ActivityIndicator, View } from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = "Cargando",
  className,
}: LoadingSpinnerProps) {
  const colors = useThemeColors();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className={cn("items-center justify-center py-10", className)}
    >
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
