import {
  PRIVATE_CALL_CONNECTED,
  PRIVATE_CALL_HANG_UP,
  privateCallTitle,
  VOICE_CONNECTING,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../lib/cn";
import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { useOptionalPrivateCall } from "../private-call-context";

export function PrivateCallStrip() {
  const colors = useThemeColors();
  const privateCall = useOptionalPrivateCall();
  if (!privateCall) return null;
  const { phase, partner } = privateCall.state;
  if (!partner || (phase !== "connecting" && phase !== "in_call")) return null;

  const isConnected = phase === "in_call";
  const status = isConnected ? PRIVATE_CALL_CONNECTED : VOICE_CONNECTING;

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
        onPress={privateCall.restore}
        accessibilityRole="button"
        accessibilityLabel={`${status}, ${privateCallTitle(partner.name)}`}
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
            numberOfLines={1}
          >
            {status}
          </Text>
        </View>
        <Text
          className="mt-0.5 text-[12px] text-content-subtle"
          numberOfLines={1}
        >
          {privateCallTitle(partner.name)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={privateCall.hangUp}
        className="w-10 h-10 rounded-[10px] items-center justify-center"
        style={{ backgroundColor: withAlpha(colors.danger, 0.1) }}
        accessibilityRole="button"
        accessibilityLabel={PRIVATE_CALL_HANG_UP}
      >
        <Feather name="phone-off" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}
