import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { useTheme, useThemeColors } from "../../theme/theme-context";

export function HeaderThemeToggle() {
  const { theme, setTheme } = useTheme();
  const colors = useThemeColors();
  const goingToLight = theme === "dark";

  return (
    <TouchableOpacity
      onPress={() => setTheme(goingToLight ? "light" : "dark")}
      className="w-8.5 h-8.5 items-center justify-center"
      accessibilityLabel={
        goingToLight ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      }
      accessibilityRole="button"
    >
      <Feather
        name={goingToLight ? "sun" : "moon"}
        size={20}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
}
