import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, useThemeColors } from "../../theme/theme-context";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const goingToLight = theme === "dark";

  return (
    <TouchableOpacity
      onPress={() => setTheme(goingToLight ? "light" : "dark")}
      activeOpacity={0.6}
      className="absolute right-4 z-10 h-9 w-9 items-center justify-center rounded-lg"
      style={{ top: insets.top + 12 }}
      accessibilityRole="button"
      accessibilityLabel={
        goingToLight ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      }
    >
      <Feather
        name={goingToLight ? "sun" : "moon"}
        size={18}
        color={colors.textSubtle}
      />
    </TouchableOpacity>
  );
}
