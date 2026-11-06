import {
  type Channel,
  NO_UNREAD_FLAGS,
  NOTIFICATION_SETTINGS_MUTED_TITLE,
  UNREAD_MESSAGES_LABEL,
  type UnreadFlags,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { CountBadge } from "../../../../components/ui/CountBadge";
import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { CallDuration } from "../../../voice/components/sidebar/CallDuration";
import { VoiceChannelParticipants } from "../../../voice/components/sidebar/VoiceChannelParticipants";
import type { SidebarVoiceParticipant } from "../../../voice/useServerVoice";

interface ChannelRowProps {
  channel: Channel;
  hasOptions: boolean;
  unread?: UnreadFlags;
  isMuted?: boolean;
  onPress: () => void;
  onOptions: () => void;
  isVoiceConnected?: boolean;
  /** Canal de voz con llamada en curso: desde cuando (ms). */
  callStartedAt?: number;
  voiceParticipants?: readonly SidebarVoiceParticipant[];
  isVoiceExpanded?: boolean;
  onToggleVoiceExpanded?: () => void;
}

export function ChannelRow({
  channel,
  hasOptions,
  unread = NO_UNREAD_FLAGS,
  isMuted = false,
  onPress,
  onOptions,
  isVoiceConnected = false,
  callStartedAt,
  voiceParticipants = [],
  isVoiceExpanded = false,
  onToggleVoiceExpanded,
}: ChannelRowProps) {
  const colors = useThemeColors();
  const { mentionCount } = unread;
  return (
    <View>
      <View className="relative flex-row items-center">
        {unread.unread ? (
          <View className="absolute left-0 top-1/2 -mt-1 h-2 w-1 rounded-r-full bg-content" />
        ) : null}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          accessibilityLabel={
            mentionCount > 0
              ? `${channel.name}, ${mentionCount} menciones sin leer`
              : unread.unread
                ? `${channel.name}, ${UNREAD_MESSAGES_LABEL.toLowerCase()}`
                : undefined
          }
          className="flex-1 flex-row items-center gap-2.5 rounded-lg px-2.5 py-[10px]"
          style={
            isVoiceConnected
              ? { backgroundColor: withAlpha(colors.success, 0.14) }
              : undefined
          }
        >
          <Feather
            name={channel.kind === "text" ? "hash" : "volume-2"}
            size={20}
            color={isVoiceConnected ? colors.success : colors.textMuted}
          />
          <Text
            className={cn(
              "flex-1 text-[16px] font-medium text-content-muted",
              unread.unread && "font-bold text-content",
              isVoiceConnected && "font-semibold text-success",
            )}
            numberOfLines={1}
          >
            {channel.name}
          </Text>
          {isMuted ? (
            <Feather
              name="bell-off"
              size={13}
              color={colors.textSubtle}
              accessibilityLabel={NOTIFICATION_SETTINGS_MUTED_TITLE}
            />
          ) : null}
          {mentionCount > 0 ? (
            <CountBadge
              count={mentionCount}
              label={`${mentionCount} menciones sin leer`}
            />
          ) : null}
          {callStartedAt !== undefined ? (
            <CallDuration
              startedAt={callStartedAt}
              className={cn(
                "text-[13px] text-content-subtle",
                isVoiceConnected && "text-success",
              )}
            />
          ) : null}
        </TouchableOpacity>
        {hasOptions ? (
          <TouchableOpacity
            onPress={onOptions}
            className="px-2 py-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Opciones del canal"
            accessibilityRole="button"
          >
            <Feather name="more-vertical" size={16} color={colors.textSubtle} />
          </TouchableOpacity>
        ) : null}
      </View>
      <VoiceChannelParticipants
        participants={voiceParticipants}
        isExpanded={isVoiceExpanded}
        onToggleExpanded={onToggleVoiceExpanded}
      />
    </View>
  );
}
