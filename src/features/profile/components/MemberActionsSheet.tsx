import {
  BAN_ACTION_LABEL,
  BLOCK_USER_LABEL,
  KICK_ACTION_LABEL,
  MUTE_ACTION_LABEL,
  UNBLOCK_USER_LABEL,
  UNMUTE_ACTION_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { cn } from "../../../lib/cn";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { BanIcon } from "../../bans/components/BanIcon";

interface MemberActionsSheetProps {
  visible: boolean;
  memberName: string;
  /** Sin esto no se muestra "Silenciar" (sin `MANAGE_MESSAGES`, o ya silenciado). */
  onMute?: () => void;
  /** Sin esto no se muestra "Quitar silencio" (no esta silenciado). */
  onUnmute?: () => void;
  /** Sin esto no se muestra "Expulsar" (sin `KICK_MEMBERS`). */
  onKick?: () => void;
  /** Sin esto no se muestra "Banear" (sin `BAN_MEMBERS`). */
  onBan?: () => void;
  /** Sin esto no se muestra "Bloquear" / "Desbloquear". */
  onToggleBlock?: () => void;
  isBlocked: boolean;
  onClose: () => void;
}

/**
 * Menu del boton "⋮" del perfil de un miembro, al estilo de Discord mobile:
 * las acciones de moderacion y el bloqueo quedan a un toque extra en vez de
 * ocupar el perfil. Cada accion cierra el menu antes de dispararse: en iOS
 * se espera a `onDismiss`, porque no se puede presentar el modal de la accion
 * (silenciar, banear, ...) mientras este todavia se esta cerrando.
 */
export function MemberActionsSheet({
  visible,
  memberName,
  onMute,
  onUnmute,
  onKick,
  onBan,
  onToggleBlock,
  isBlocked,
  onClose,
}: MemberActionsSheetProps) {
  const colors = useThemeColors();
  const hasModeratorActions = Boolean(onMute || onUnmute || onKick || onBan);

  /** Solo iOS: la accion elegida, que se dispara en `onDismiss`. */
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  function closeThen(action: () => void) {
    return () => {
      if (Platform.OS === "ios") setPendingAction(() => action);
      onClose();
      if (Platform.OS !== "ios") action();
    };
  }

  function runPendingAction() {
    setPendingAction(null);
    pendingAction?.();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={runPendingAction}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />

          <Text
            className="mb-2.5 px-2 text-[14px] font-bold text-content-subtle"
            numberOfLines={1}
          >
            {memberName}
          </Text>

          {hasModeratorActions ? (
            <Text className="mb-1 px-2 text-[11px] font-bold tracking-[1.2px] text-content-subtle">
              ACCIONES DE MODERADORES
            </Text>
          ) : null}

          {onUnmute ? (
            <SheetOption
              icon={<Feather name="mic" size={16} color={colors.info} />}
              iconBackground={withAlpha(colors.info, 0.15)}
              label={UNMUTE_ACTION_LABEL}
              onPress={closeThen(onUnmute)}
            />
          ) : null}

          {onMute ? (
            <SheetOption
              icon={<Feather name="mic-off" size={16} color={colors.danger} />}
              iconBackground={withAlpha(colors.danger, 0.15)}
              label={MUTE_ACTION_LABEL}
              danger
              onPress={closeThen(onMute)}
            />
          ) : null}

          {onKick ? (
            <SheetOption
              icon={<Feather name="user-x" size={16} color={colors.danger} />}
              iconBackground={withAlpha(colors.danger, 0.15)}
              label={KICK_ACTION_LABEL}
              danger
              onPress={closeThen(onKick)}
            />
          ) : null}

          {onBan ? (
            <SheetOption
              icon={<BanIcon size={16} color={colors.danger} />}
              iconBackground={withAlpha(colors.danger, 0.15)}
              label={BAN_ACTION_LABEL}
              danger
              onPress={closeThen(onBan)}
            />
          ) : null}

          {hasModeratorActions && onToggleBlock ? (
            <View className="mx-2 my-2 h-px bg-line" />
          ) : null}

          {onToggleBlock ? (
            <SheetOption
              icon={
                <Feather
                  name={isBlocked ? "shield" : "slash"}
                  size={16}
                  color={colors.danger}
                />
              }
              iconBackground={withAlpha(colors.danger, 0.15)}
              label={isBlocked ? UNBLOCK_USER_LABEL : BLOCK_USER_LABEL}
              danger
              onPress={closeThen(onToggleBlock)}
            />
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center rounded-xl bg-surface-input py-3.5"
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text className="text-[14px] font-bold text-content-muted">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SheetOption({
  icon,
  iconBackground,
  label,
  danger = false,
  onPress,
}: {
  icon: ReactNode;
  iconBackground: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        className="h-9.5 w-9.5 items-center justify-center rounded-[11px]"
        style={{ backgroundColor: iconBackground }}
      >
        {icon}
      </View>
      <Text
        className={cn(
          "text-[15px] font-bold",
          danger ? "text-danger" : "text-content",
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
