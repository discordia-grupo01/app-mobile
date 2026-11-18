import {
  boostsSectionTitleFor,
  EMOJIS_SECTION_TITLE,
  MODERATION_AUDIT_TITLE,
  REPORTS_TITLE,
  WORD_FILTER_TITLE,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "../../../../../lib/color";
import { useThemeColors } from "../../../../../theme/theme-context";

export type SettingsStep =
  | "menu"
  | "profile"
  | "boosts"
  | "emojis"
  | "words"
  | "reports"
  | "audit"
  | "delete";

const STEP_TITLES: Record<Exclude<SettingsStep, "boosts">, string> = {
  menu: "Configuración del servidor",
  profile: "Perfil del servidor",
  emojis: EMOJIS_SECTION_TITLE,
  words: WORD_FILTER_TITLE,
  reports: REPORTS_TITLE,
  audit: MODERATION_AUDIT_TITLE,
  delete: "Eliminar servidor",
};

interface SettingsHeaderProps {
  step: SettingsStep;
  /** Boosts nombra al servidor en el título ("Boosts de Club de Lectura"). */
  serverName: string;
  /** Solo se muestra en el paso "reports", al lado del titulo. */
  pendingReports?: number;
  /** `false` si no hay menú al que volver (un miembro que solo ve Boosts). */
  canGoBack?: boolean;
  onBack: () => void;
  onClose: () => void;
}

export function SettingsHeader({
  step,
  serverName,
  pendingReports = 0,
  canGoBack = true,
  onBack,
  onClose,
}: SettingsHeaderProps) {
  const colors = useThemeColors();
  const isReports = step === "reports";

  return (
    <View className="flex-row items-center gap-2 border-b border-line px-4 py-3">
      {step !== "menu" && canGoBack ? (
        <TouchableOpacity
          className="w-10 h-10 rounded-xl items-center justify-center bg-surface-input"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
      {isReports ? (
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: withAlpha(colors.warning, 0.15) }}
        >
          <Feather name="flag" size={18} color={colors.warning} />
        </View>
      ) : null}
      <Text
        className="flex-1 text-[17px] font-bold text-content"
        numberOfLines={1}
      >
        {step === "boosts"
          ? boostsSectionTitleFor(serverName)
          : STEP_TITLES[step]}
        {isReports && pendingReports > 0 ? (
          <Text className="text-warning"> ({pendingReports})</Text>
        ) : null}
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
