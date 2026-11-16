import {
  type Channel,
  DELETE_CHANNEL_LABEL,
  EDIT_CHANNEL_LABEL,
  NOTIFICATION_SETTINGS_MENU_LABEL,
  OVERRIDE_CHANNEL_PERMISSIONS_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { withAlpha } from "../../../../lib/color";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ChannelOptionsSheetProps {
  visible: boolean;
  channel: Channel | null;
  canManageChannel: boolean;
  canManagePermissions: boolean;
  onNotifications?: () => void;
  onClose: () => void;
  onEdit: () => void;
  onOverridePermissions: () => void;
  onDelete: () => void;
}

function SheetOption({
  icon,
  label,
  color,
  danger,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        className="w-9.5 h-9.5 rounded-[11px] items-center justify-center"
        style={{ backgroundColor: withAlpha(color, 0.15) }}
      >
        <Feather name={icon} size={16} color={color} />
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

export function ChannelOptionsSheet({
  visible,
  channel,
  canManageChannel,
  canManagePermissions,
  onNotifications,
  onClose,
  onEdit,
  onOverridePermissions,
  onDelete,
}: ChannelOptionsSheetProps) {
  const colors = useThemeColors();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4.5 pt-2.5 pb-7">
          <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-4" />

          {channel ? (
            <View className="flex-row items-center gap-2 mb-2.5 px-2">
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={14}
                color={colors.textSubtle}
              />
              <Text
                className="flex-1 text-[14px] font-bold text-content-subtle"
                numberOfLines={1}
              >
                {channel.name}
              </Text>
            </View>
          ) : null}

          {onNotifications ? (
            <SheetOption
              icon="bell"
              label={NOTIFICATION_SETTINGS_MENU_LABEL}
              color={colors.info}
              onPress={onNotifications}
            />
          ) : null}

          {canManageChannel ? (
            <SheetOption
              icon="edit-2"
              label={EDIT_CHANNEL_LABEL}
              color={colors.info}
              onPress={onEdit}
            />
          ) : null}

          {canManagePermissions ? (
            <SheetOption
              icon="shield"
              label={OVERRIDE_CHANNEL_PERMISSIONS_LABEL}
              color={colors.info}
              onPress={onOverridePermissions}
            />
          ) : null}

          {canManageChannel ? (
            <SheetOption
              icon="trash-2"
              label={DELETE_CHANNEL_LABEL}
              color={colors.danger}
              danger
              onPress={onDelete}
            />
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center py-3.5 rounded-xl bg-surface-input"
            onPress={onClose}
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
