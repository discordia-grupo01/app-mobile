import { BAN_ACTION_LABEL, KICK_ACTION_LABEL } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "./BanIcon";

interface ModeratorActionsProps {
  /** Sin esto no se muestra "Expulsar" (sin `KICK_MEMBERS`). */
  onKick?: () => void;
  /** Sin esto no se muestra "Banear" (sin `BAN_MEMBERS`). */
  onBan?: () => void;
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-11 flex-row items-center gap-2.5 rounded-xl border border-line bg-surface-input px-3.5 py-2.5"
    >
      {icon}
      <Text className="text-[14px] font-semibold text-danger">{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * Seccion "Acciones de moderadores" del perfil de un miembro, al estilo de
 * Discord. Quien la usa decide que acciones mostrar (permiso, no es el dueño
 * ni uno mismo); sin ninguna no se muestra nada.
 */
export function ModeratorActions({ onKick, onBan }: ModeratorActionsProps) {
  const colors = useThemeColors();
  if (!onKick && !onBan) return null;

  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-bold tracking-[1.2px] text-content-subtle">
        ACCIONES DE MODERADORES
      </Text>
      <View className="gap-2">
        {onKick ? (
          <ActionRow
            icon={<Feather name="user-x" size={16} color={colors.danger} />}
            label={KICK_ACTION_LABEL}
            onPress={onKick}
          />
        ) : null}
        {onBan ? (
          <ActionRow
            icon={<BanIcon size={16} color={colors.danger} />}
            label={BAN_ACTION_LABEL}
            onPress={onBan}
          />
        ) : null}
      </View>
    </View>
  );
}
