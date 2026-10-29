import { type Channel } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { VoiceChannelParticipants } from "../../../voice/components/sidebar/VoiceChannelParticipants";
import type { SidebarVoiceParticipant } from "../../../voice/useServerVoice";

interface ChannelRowProps {
  channel: Channel;
  canManage: boolean;
  unreadMentions?: number;
  onPress: () => void;
  onOptions: () => void;
  isVoiceConnected?: boolean;
  voiceParticipants?: readonly SidebarVoiceParticipant[];
  isVoiceExpanded?: boolean;
  onToggleVoiceExpanded?: () => void;
}

export function ChannelRow({
  channel,
  canManage,
  unreadMentions = 0,
  onPress,
  onOptions,
  isVoiceConnected = false,
  voiceParticipants = [],
  isVoiceExpanded = false,
  onToggleVoiceExpanded,
}: ChannelRowProps) {
  const colors = useThemeColors();
  return (
    <View>
      <View className="relative flex-row items-center">
        {unreadMentions > 0 ? (
          <View className="absolute left-0 top-1/2 -mt-1 h-2 w-1 rounded-r-full bg-content" />
        ) : null}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          accessibilityLabel={
            unreadMentions > 0
              ? `${channel.name}, ${unreadMentions} menciones sin leer`
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
              unreadMentions > 0 && "font-bold text-content",
              isVoiceConnected && "font-semibold text-success",
            )}
            numberOfLines={1}
          >
            {channel.name}
          </Text>
        </TouchableOpacity>
        {canManage ? (
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
