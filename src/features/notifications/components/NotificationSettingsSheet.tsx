import {
  NOTIFICATION_LEVEL_DEFAULT_BADGE,
  NOTIFICATION_LEVEL_INHERITED_BADGE,
  NOTIFICATION_LEVELS,
  NOTIFICATION_SETTINGS_CLOSE_LABEL,
  NOTIFICATION_SETTINGS_LEVEL_TITLE,
  NOTIFICATION_SETTINGS_MUTED_HINT,
  NOTIFICATION_SETTINGS_SERVER_MUTED_NOTE,
  notificationLevelResetLabel,
  notificationMuteLabel,
  notificationSettingsChannelTitle,
  notificationSettingsServerTitle,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../theme/theme-context";
import {
  type NotificationTarget,
  useNotificationTarget,
} from "../useNotificationTarget";
import { NotificationLevelOption } from "./NotificationLevelOption";

interface NotificationSettingsSheetProps {
  target: NotificationTarget | null;
  onClose: () => void;
}

export function NotificationSettingsSheet({
  target,
  onClose,
}: NotificationSettingsSheetProps) {
  const colors = useThemeColors();
  const state = useNotificationTarget(target);

  function close() {
    state?.clearError();
    onClose();
  }

  if (!target || !state) return null;

  const title = state.isChannel
    ? notificationSettingsChannelTitle(target.name)
    : notificationSettingsServerTitle(target.name);
  const muteLabel = notificationMuteLabel(target.scope, state.isMuted);
  const parentBadge = state.isChannel
    ? NOTIFICATION_LEVEL_INHERITED_BADGE
    : NOTIFICATION_LEVEL_DEFAULT_BADGE;
  const isSilenced = state.isMuted || state.isServerSilenced;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4.5 pt-2.5 pb-7">
          <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-4" />
          <Text
            className="text-[17px] font-bold text-content mb-4"
            numberOfLines={2}
            accessibilityRole="header"
          >
            {title}
          </Text>

          <FormErrorBanner message={state.errorMessage} />

          <View className="flex-row items-center gap-3 rounded-[14px] border border-line bg-surface-input px-4 py-3 mb-5">
            <Feather
              name={isSilenced ? "bell-off" : "bell"}
              size={18}
              color={colors.textSubtle}
            />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-content">
                {muteLabel}
              </Text>
              <Text className="mt-0.5 text-[12px] leading-[17px] text-content-muted">
                {state.isServerSilenced
                  ? NOTIFICATION_SETTINGS_SERVER_MUTED_NOTE
                  : NOTIFICATION_SETTINGS_MUTED_HINT}
              </Text>
            </View>
            <Switch
              value={state.isMuted}
              onValueChange={state.toggleMuted}
              disabled={state.isSaving}
              accessibilityLabel={muteLabel}
              trackColor={{ false: colors.bgHover, true: colors.accent }}
              thumbColor="#ffffff"
            />
          </View>

          <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">
            {NOTIFICATION_SETTINGS_LEVEL_TITLE}
          </Text>
          <View
            className="overflow-hidden rounded-[14px] border border-line"
            accessibilityRole="radiogroup"
          >
            {NOTIFICATION_LEVELS.map((level, index) => {
              const isSelected = level === state.configuredLevel;
              return (
                <NotificationLevelOption
                  key={level}
                  level={level}
                  isSelected={isSelected}
                  badge={isSelected && state.followsParent ? parentBadge : null}
                  disabled={state.isSaving}
                  isLast={index === NOTIFICATION_LEVELS.length - 1}
                  onPress={() => state.selectLevel(level)}
                />
              );
            })}
          </View>
          {state.followsParent ? null : (
            <TouchableOpacity
              onPress={state.resetLevel}
              disabled={state.isSaving}
              accessibilityRole="button"
              className="mt-2 self-start py-1"
            >
              <Text className="text-[13px] font-bold text-accent">
                {notificationLevelResetLabel(target.scope)}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-5 items-center py-3.5 rounded-xl bg-surface-input"
            onPress={close}
            accessibilityRole="button"
          >
            <Text className="text-[14px] font-bold text-content-muted">
              {NOTIFICATION_SETTINGS_CLOSE_LABEL}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
