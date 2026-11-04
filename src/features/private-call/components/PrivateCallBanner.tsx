import {
  PRIVATE_CALL_HANG_UP,
  privateCallTitle,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { CallDuration } from "../../voice/components/sidebar/CallDuration";
import { useOptionalPrivateCall } from "../private-call-context";
import { useDraggableBanner } from "../useDraggableBanner";

const BACK_TO_CALL = "Volver a la llamada";
const MOVE_HINT = "Arrastralo para moverlo de lugar";
const HEADER_HEIGHT = 60;

export function PrivateCallBanner() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const privateCall = useOptionalPrivateCall();
  const top = insets.top + HEADER_HEIGHT + 8;
  const drag = useDraggableBanner(top);
  if (!privateCall?.isMinimized) return null;
  const { phase, partner } = privateCall.state;
  if (!partner || (phase !== "connecting" && phase !== "in_call")) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 items-center px-4"
      style={{ top }}
    >
      <Animated.View
        {...drag.panHandlers}
        onLayout={drag.onLayout}
        style={{ maxWidth: "100%", transform: drag.transform }}
      >
        <View
          accessibilityRole="summary"
          accessibilityHint={MOVE_HINT}
          className="max-w-full flex-row items-center gap-1 rounded-full border bg-surface-raised py-1 pl-3 pr-1"
          style={{
            borderColor: withAlpha(colors.success, 0.3),
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          <TouchableOpacity
            onPress={privateCall.restore}
            activeOpacity={0.7}
            className="min-w-0 shrink flex-row items-center gap-2 py-1 pr-2"
            accessibilityRole="button"
            accessibilityLabel={BACK_TO_CALL}
          >
            <View className="h-2 w-2 rounded-full bg-success" />
            <Text
              className="shrink text-[14px] font-semibold text-content"
              numberOfLines={1}
            >
              {privateCallTitle(partner.name)}
            </Text>
            {privateCall.connectedAt !== null ? (
              <CallDuration
                startedAt={privateCall.connectedAt}
                className="text-[12px] text-success"
              />
            ) : null}
            <Feather name="maximize-2" size={14} color={colors.textSubtle} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={privateCall.hangUp}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: withAlpha(colors.danger, 0.15) }}
            accessibilityRole="button"
            accessibilityLabel={PRIVATE_CALL_HANG_UP}
          >
            <Feather name="phone-off" size={15} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
