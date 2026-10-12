import {
  BAN_ACTION_LABEL,
  KICK_ACTION_LABEL,
  MUTE_ACTION_LABEL,
  UNMUTE_ACTION_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "./BanIcon";

interface ModeratorActionsProps {
  /** Sin esto no se muestra "Silenciar" (sin `MANAGE_MESSAGES`, o ya silenciado). */
  onMute?: () => void;
  /** Sin esto no se muestra "Quitar silencio" (no esta silenciado). */
  onUnmute?: () => void;
  /** Mientras se levanta el silencio. */
  isUnmuting?: boolean;
  /** Sin esto no se muestra "Expulsar" (sin `KICK_MEMBERS`). */
  onKick?: () => void;
  /** Sin esto no se muestra "Banear" (sin `BAN_MEMBERS`). */
  onBan?: () => void;
}

function ActionRow({
  icon,
  label,
  onPress,
  tone = "danger",
  isLoading = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  tone?: "danger" | "neutral";
  isLoading?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading }}
      className="min-h-11 flex-row items-center gap-2.5 rounded-xl border border-line bg-surface-input px-3.5 py-2.5"
    >
      {icon}
      <Text
        className={
          tone === "danger"
            ? "flex-1 text-[14px] font-semibold text-danger"
            : "flex-1 text-[14px] font-semibold text-content"
        }
      >
        {label}
      </Text>
      {isLoading ? <ActivityIndicator size="small" /> : null}
    </TouchableOpacity>
  );
}

/**
 * Seccion "Acciones de moderadores" del perfil de un miembro, al estilo de
 * Discord. Quien la usa decide que acciones mostrar (permiso, no es el dueño
 * ni uno mismo); sin ninguna no se muestra nada.
 */
export function ModeratorActions({
  onMute,
  onUnmute,
  isUnmuting = false,
  onKick,
  onBan,
}: ModeratorActionsProps) {
  const colors = useThemeColors();
  if (!onMute && !onUnmute && !onKick && !onBan) return null;

  return (
    <View>
      <Text className="mb-1.5 text-[11px] font-bold tracking-[1.2px] text-content-subtle">
        ACCIONES DE MODERADORES
      </Text>
      <View className="gap-2">
        {onUnmute ? (
          <ActionRow
            icon={<Feather name="mic" size={16} color={colors.text} />}
            label={UNMUTE_ACTION_LABEL}
            onPress={onUnmute}
            tone="neutral"
            isLoading={isUnmuting}
          />
        ) : null}
        {onMute ? (
          <ActionRow
            icon={<Feather name="mic-off" size={16} color={colors.danger} />}
            label={MUTE_ACTION_LABEL}
            onPress={onMute}
          />
        ) : null}
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
