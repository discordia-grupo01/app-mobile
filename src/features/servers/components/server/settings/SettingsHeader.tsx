import { WORD_FILTER_TITLE } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../../../theme/theme-context";

export type SettingsStep = "menu" | "profile" | "words" | "delete";

const STEP_TITLES: Record<SettingsStep, string> = {
  menu: "Configuración del servidor",
  profile: "Perfil del servidor",
  words: WORD_FILTER_TITLE,
  delete: "Eliminar servidor",
};

interface SettingsHeaderProps {
  step: SettingsStep;
  onBack: () => void;
  onClose: () => void;
}

export function SettingsHeader({ step, onBack, onClose }: SettingsHeaderProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2 border-b border-line px-4 py-3">
      {step !== "menu" ? (
        <TouchableOpacity
          className="w-10 h-10 rounded-xl items-center justify-center bg-surface-input"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
      <Text
        className="flex-1 text-[17px] font-bold text-content"
        numberOfLines={1}
      >
        {STEP_TITLES[step]}
      </Text>
      <TouchableOpacity
        className="w-10 h-10 rounded-xl items-center justify-center"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar configuración"
      >
        <Feather name="x" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}
