import {
  VOICE_CONNECTED,
  VOICE_CONNECTING,
  VOICE_LEAVE_LABEL,
  VOICE_RECONNECTING,
  voiceConnectedLocation,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { useOptionalVoiceSession } from "../../voice-session-context";
import { channelTargetOf } from "../../channel-target";
import { VoiceNotice } from "../VoiceNotice";

const STATUS_LABEL = {
  connecting: VOICE_CONNECTING,
  reconnecting: VOICE_RECONNECTING,
  connected: VOICE_CONNECTED,
} as const;

export function VoiceConnectedStrip() {
  const colors = useThemeColors();
  const voice = useOptionalVoiceSession();
  const target = channelTargetOf(voice?.state.target);
  if (voice && !target && voice.state.notice) {
    return (
      <View className="px-3.5 py-2 border-t border-t-line">
        <VoiceNotice
          message={voice.state.notice}
          onDismiss={voice.dismissNotice}
        />
      </View>
    );
  }
  if (!voice || !target || voice.state.status === "idle") return null;

  const isConnected = voice.state.status === "connected";

  return (
    <View
      className="flex-row items-center gap-2 px-3.5 py-2 border-t"
      style={{
        backgroundColor: withAlpha(colors.success, 0.1),
        borderTopColor: withAlpha(colors.success, 0.2),
      }}
    >
      <TouchableOpacity
        className="flex-1 min-w-0"
        activeOpacity={0.7}
        onPress={voice.focusConnectedChannel}
        accessibilityRole="button"
        accessibilityLabel={`${STATUS_LABEL[voice.state.status]}, ${target.channelName}`}
      >
        <View className="flex-row items-center gap-2">
          <View
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-success" : "bg-highlight",
            )}
          />
          <Text
            className={cn(
              "text-[14px] font-semibold",
              isConnected ? "text-success" : "text-highlight",
            )}
          >
            {STATUS_LABEL[voice.state.status]}
          </Text>
        </View>
        <Text
          className="mt-0.5 text-[12px] text-content-subtle"
          numberOfLines={1}
        >
          {voiceConnectedLocation(target.channelName, target.serverName)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={voice.leave}
        className="w-10 h-10 rounded-[10px] items-center justify-center"
        style={{ backgroundColor: withAlpha(colors.danger, 0.1) }}
        accessibilityRole="button"
        accessibilityLabel={VOICE_LEAVE_LABEL}
      >
        <Feather name="phone-off" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}
