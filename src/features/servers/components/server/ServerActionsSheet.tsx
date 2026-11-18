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
import { BoostLevelIcon } from "../../../boosts/components/BoostLevelIcon";
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
  const isCard = !!subtitle;

  if (isCard) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        className="flex-row items-center gap-3.5 rounded-2xl bg-surface-raised p-3.5 mb-2"
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-surface-input">
          {typeof icon === "string" ? (
            <Feather name={icon} size={20} color={colors.sky} />
          ) : (
            icon
          )}
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] font-bold text-content mb-0.5"
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text className="text-[12px] text-content-subtle" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSubtle} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-row items-center gap-3.5 py-2.5 px-2 rounded-xl"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={danger ? { backgroundColor: "rgba(224,82,82,0.14)" } : undefined}
      >
        <View
          className={
            danger
              ? "w-10 h-10 rounded-xl items-center justify-center"
              : "w-10 h-10 rounded-xl items-center justify-center bg-surface-raised"
          }
        >
          {typeof icon === "string" ? (
            <Feather
              name={icon}
              size={18}
              color={danger ? colors.danger : colors.sky}
            />
          ) : (
            icon
          )}
        </View>
      </View>
      <Text
        className={
          danger
            ? "flex-1 text-[15px] font-bold text-danger"
            : "flex-1 text-[15px] font-bold text-content"
        }
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickActionTile({
  icon,
  label,
  topRight,
  onPress,
}: {
  icon: FeatherIconName | ReactElement;
  label: string;
  topRight?: ReactElement;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center gap-1.5">
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        className="w-14 h-14 rounded-2xl bg-surface-raised relative overflow-hidden"
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View className="flex-1 items-center justify-center pt-1.5">
          {typeof icon === "string" ? (
            <Feather name={icon} size={22} color={colors.sky} />
          ) : (
            icon
          )}
        </View>
        {topRight ? (
          <View className="absolute top-0 right-0 bg-surface-modal rounded-bl-xl pl-1.5 pr-1 pt-0.5 pb-0.5 items-center justify-center">
            {topRight}
          </View>
        ) : null}
      </TouchableOpacity>
      <Text className="text-[12px] font-semibold text-content text-center">
        {label}
      </Text>
    </View>
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
                  className="text-[17px] font-bold text-content"
                  numberOfLines={1}
                >
                  {server.name}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <BoostLevelIcon level={level} size={14} tight bare />
                  <Text
                    className="text-[12px] text-content-muted"
                    numberOfLines={1}
                  >
                    {metaLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick action tiles */}
            <View className="flex-row gap-2.5 mb-4">
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
                topRight={<BoostLevelIcon level={level} size={13} tight bare />}
                onPress={() => {
                  onClose();
                  onBoosts();
                }}
              />
              <QuickActionTile
                icon="smile"
                label={SERVER_QUICK_ACTION_LABELS.emojis}
                topRight={
                  emojiBadge ? (
                    <Text className="text-[10px] font-bold text-content-muted leading-tight">
                      {emojiBadge}
                    </Text>
                  ) : undefined
                }
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
            <View className="h-px bg-line my-1.5 mx-2" />

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
