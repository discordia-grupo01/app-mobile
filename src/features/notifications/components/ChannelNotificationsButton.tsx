import {
  type Channel,
  channelHasNotifications,
  isChannelSilenced,
  NOTIFICATION_SETTINGS_MENU_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { useOptionalNotificationSettings } from "../NotificationSettingsContext";
import { NotificationSettingsSheet } from "./NotificationSettingsSheet";

interface ChannelNotificationsButtonProps {
  channel: Channel;
  serverId: string;
}

export function ChannelNotificationsButton({
  channel,
  serverId,
}: ChannelNotificationsButtonProps) {
  const colors = useThemeColors();
  const notificationSettings = useOptionalNotificationSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!notificationSettings || !channelHasNotifications(channel)) return null;

  const isSilenced = isChannelSilenced(
    notificationSettings.settings,
    serverId,
    channel.id,
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="w-8.5 h-8.5 items-center justify-center"
        accessibilityLabel={NOTIFICATION_SETTINGS_MENU_LABEL}
        accessibilityRole="button"
      >
        <Feather
          name={isSilenced ? "bell-off" : "bell"}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      <NotificationSettingsSheet
        target={
          isOpen
            ? {
                scope: "channel",
                targetId: channel.id,
                serverId,
                name: channel.name,
              }
            : null
        }
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
