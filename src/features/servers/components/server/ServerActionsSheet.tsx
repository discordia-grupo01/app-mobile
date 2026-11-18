import {
  emojiSlotsBadge,
  SERVER_MENU_CREATE_CATEGORY_LABEL,
  SERVER_MENU_CREATE_CHANNEL_LABEL,
  SERVER_MENU_LEAVE_LABEL,
  SERVER_MENU_TRANSFER_LABEL,
  SERVER_QUICK_ACTION_LABELS,
  SERVER_SETTINGS_MENU_DESCRIPTION,
  SERVER_SETTINGS_MENU_LABEL,
  serverBoostCount,
  serverBoostLevel,
  serverSheetMetaLabel,
  type ServerSummary,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps, ReactElement } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { useThemeColors } from "../../../../theme/theme-context";
import { BoostActionIcon } from "../../../boosts/components/BoostActionIcon";
import { useServerEmojis } from "../../../emojis/useServerEmojis";
import { resolveServerIconUrl } from "../../api";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

function SheetRow({
  icon,
  label,
  subtitle,
  danger,
  onPress,
}: {
  icon: FeatherIconName | ReactElement;
  label: string;
  subtitle?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{
          backgroundColor: danger ? "rgba(224,82,82,0.14)" : "rgba(0,0,0,0.07)",
        }}
      >
        {typeof icon === "string" ? (
          <Feather
            name={icon}
            size={18}
            color={danger ? colors.danger : colors.text}
          />
        ) : (
          icon
        )}
      </View>
      <View className="flex-1">
        <Text
          className={
            danger
              ? "text-[15px] font-bold text-danger"
              : "text-[15px] font-bold text-content"
          }
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            className="text-[12px] text-content-muted mt-0.5"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={17} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

function QuickActionTile({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: FeatherIconName | ReactElement;
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-1 items-center gap-2"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="relative">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.07)" }}
        >
          {typeof icon === "string" ? (
            <Feather name={icon} size={22} color={colors.text} />
          ) : (
            icon
          )}
        </View>
        {badge ? (
          <View
            className="absolute -top-1.5 -right-2 rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: colors.boostPaper }}
          >
            <Text className="text-[10px] font-bold text-content-muted">
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="text-[11px] font-semibold text-content-muted text-center">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export interface ServerActionsSheetProps {
  visible: boolean;
  server: ServerSummary;
  memberCount: number;
  isOwner: boolean;
  incomingTransfer: boolean;
  canInvite: boolean;
  canManageChannels: boolean;
  showTransfer: boolean;
  onInvite: () => void;
  onNotifications: () => void;
  onBoosts: () => void;
  onEmojis: () => void;
  onSettings: () => void;
  onCreateChannel: () => void;
  onCreateCategory: () => void;
  onTransfer: () => void;
  onLeave: () => void;
  onClose: () => void;
}

export function ServerActionsSheet({
  visible,
  server,
  memberCount,
  isOwner,
  incomingTransfer,
  canInvite,
  canManageChannels,
  showTransfer,
  onInvite,
  onNotifications,
  onBoosts,
  onEmojis,
  onSettings,
  onCreateChannel,
  onCreateCategory,
  onTransfer,
  onLeave,
  onClose,
}: ServerActionsSheetProps) {
  const { page } = useServerEmojis(server.id);
  const emojiBadge = page
    ? emojiSlotsBadge(page.emojis.length, page.max_emojis)
    : undefined;
  const level = serverBoostLevel(server);
  const metaLabel = serverSheetMetaLabel(
    level,
    serverBoostCount(server),
    memberCount,
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.5)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong">
          {/* Drag handle */}
          <View className="items-center pt-2.5 pb-1">
            <View className="w-9 h-1 rounded-full bg-line-strong" />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pb-8"
          >
            {/* Server header */}
            <View className="flex-row items-center gap-3 py-4">
              <Avatar
                name={server.name}
                uri={resolveServerIconUrl(server.icon_url)}
                size={48}
                borderRadius={14}
              />
              <View className="flex-1">
                <Text
                  className="text-[16px] font-bold text-content"
                  numberOfLines={1}
                >
                  {server.name}
                </Text>
                <Text
                  className="text-[12px] text-content-muted mt-0.5"
                  numberOfLines={1}
                >
                  {metaLabel}
                </Text>
              </View>
            </View>

            {/* Quick action tiles */}
            <View className="flex-row gap-2 mb-4">
              {canInvite ? (
                <QuickActionTile
                  icon="user-plus"
                  label={SERVER_QUICK_ACTION_LABELS.invite}
                  onPress={() => {
                    onClose();
                    onInvite();
                  }}
                />
              ) : null}
              <QuickActionTile
                icon="bell"
                label={SERVER_QUICK_ACTION_LABELS.notifications}
                onPress={() => {
                  onClose();
                  onNotifications();
                }}
              />
              <QuickActionTile
                icon={<BoostActionIcon size={22} />}
                label={SERVER_QUICK_ACTION_LABELS.boosts}
                onPress={() => {
                  onClose();
                  onBoosts();
                }}
              />
              <QuickActionTile
                icon="smile"
                label={SERVER_QUICK_ACTION_LABELS.emojis}
                badge={emojiBadge}
                onPress={() => {
                  onClose();
                  onEmojis();
                }}
              />
            </View>

            {/* Configuración del servidor */}
            <SheetRow
              icon="settings"
              label={SERVER_SETTINGS_MENU_LABEL}
              subtitle={SERVER_SETTINGS_MENU_DESCRIPTION}
              onPress={() => {
                onClose();
                onSettings();
              }}
            />

            {/* Separador */}
            <View className="h-px bg-line mx-1 my-1" />

            {/* Crear canal / categoría */}
            {canManageChannels ? (
              <>
                <SheetRow
                  icon="plus"
                  label={SERVER_MENU_CREATE_CHANNEL_LABEL}
                  onPress={() => {
                    onClose();
                    onCreateChannel();
                  }}
                />
                <SheetRow
                  icon="folder-plus"
                  label={SERVER_MENU_CREATE_CATEGORY_LABEL}
                  onPress={() => {
                    onClose();
                    onCreateCategory();
                  }}
                />
              </>
            ) : null}

            {/* Transferir propiedad */}
            {showTransfer ? (
              <SheetRow
                icon="repeat"
                label={
                  incomingTransfer
                    ? "Responder transferencia de propiedad"
                    : SERVER_MENU_TRANSFER_LABEL
                }
                onPress={() => {
                  onClose();
                  onTransfer();
                }}
              />
            ) : null}

            {/* Separador antes de abandonar */}
            <View className="h-px bg-line mx-1 my-1" />

            {/* Abandonar servidor */}
            <SheetRow
              icon="log-out"
              label={SERVER_MENU_LEAVE_LABEL}
              danger
              onPress={() => {
                onClose();
                onLeave();
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
