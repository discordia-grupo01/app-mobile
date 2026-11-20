import {
  NOTIFICATION_LEVEL_DEFAULT_BADGE,
  NOTIFICATION_LEVEL_INHERITED_BADGE,
  NOTIFICATION_LEVELS,
  NOTIFICATION_SETTINGS_LEVEL_MUTED_NOTE,
  NOTIFICATION_SETTINGS_LEVEL_TITLE,
  NOTIFICATION_SETTINGS_MUTED_HINT,
  NOTIFICATION_SETTINGS_SERVER_MUTED_NOTE,
  notificationLevelResetLabel,
  notificationMuteLabel,
  notificationSettingsChannelTitle,
  notificationSettingsServerTitle,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { FullScreenModal } from "../../../../components/ui/FullScreenModal";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import {
  type NotificationTarget,
  useNotificationTarget,
} from "./useNotificationTarget";
import { NotificationLevelOption } from "./NotificationLevelOption";
import { Switch } from "../../../../components/ui/Switch";

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
  const isLevelDisabled = state.isSaving || isSilenced;

  return (
    <FullScreenModal visible title={title} onClose={close}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4.5 pt-5 pb-8"
      >
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
            checked={state.isMuted}
            onChange={() => state.toggleMuted()}
            disabled={state.isSaving}
            label={muteLabel}
          />
        </View>

        <Text className="text-[14px] font-semibold text-content mb-2">
          {NOTIFICATION_SETTINGS_LEVEL_TITLE}
        </Text>
        {isSilenced ? (
          <View className="mb-2 flex-row items-center gap-2">
            <Feather name="bell-off" size={13} color={colors.textSubtle} />
            <Text className="flex-1 text-[12px] leading-[17px] text-content-muted">
              {NOTIFICATION_SETTINGS_LEVEL_MUTED_NOTE}
            </Text>
          </View>
        ) : null}
        <View
          className={cn(
            isSilenced ? "opacity-50" : state.isSaving && "opacity-60",
          )}
        >
          <View
            className="overflow-hidden rounded-[14px] border border-line"
            accessibilityRole="radiogroup"
            accessibilityState={{ disabled: isLevelDisabled }}
          >
            {NOTIFICATION_LEVELS.map((level, index) => {
              const isSelected = level === state.configuredLevel;
              return (
                <NotificationLevelOption
                  key={level}
                  level={level}
                  isSelected={isSelected}
                  badge={isSelected && state.followsParent ? parentBadge : null}
                  disabled={isLevelDisabled}
                  isLast={index === NOTIFICATION_LEVELS.length - 1}
                  onPress={() => state.selectLevel(level)}
                />
              );
            })}
          </View>
          {state.followsParent ? null : (
            <TouchableOpacity
              onPress={state.resetLevel}
              disabled={isLevelDisabled}
              accessibilityRole="button"
              className="mt-2 self-start py-1"
            >
              <Text className="text-[13px] font-bold text-accent">
                {notificationLevelResetLabel(target.scope)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </FullScreenModal>
  );
}
