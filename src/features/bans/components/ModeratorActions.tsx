import { BAN_ACTION_LABEL } from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "./BanIcon";

interface ModeratorActionsProps {
  onBan: () => void;
}

/**
 * Seccion "Acciones de moderadores" del perfil de un miembro, al estilo de
 * Discord. Quien la usa decide cuando mostrarla (permiso, no es el dueño ni
 * uno mismo).
 */
export function ModeratorActions({ onBan }: ModeratorActionsProps) {
  const colors = useThemeColors();

  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-bold tracking-[1.2px] text-content-subtle">
        ACCIONES DE MODERADORES
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBan}
        accessibilityRole="button"
        className="min-h-11 flex-row items-center gap-2.5 rounded-xl border border-line bg-surface-input px-3.5 py-2.5"
      >
        <BanIcon size={16} color={colors.danger} />
        <Text className="text-[14px] font-semibold text-danger">
          {BAN_ACTION_LABEL}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
