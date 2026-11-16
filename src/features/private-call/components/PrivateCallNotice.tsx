import type { PrivateCallEndReason } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ComponentProps, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../../../theme/theme-context";
import { useOptionalPrivateCall } from "../private-call-context";

const AUTO_DISMISS_MS = 6_000;

type IconName = ComponentProps<typeof Feather>["name"];
type ThemeColors = ReturnType<typeof useThemeColors>;
type ColorKey = "danger" | "textMuted" | "highlight";

const ICONS: Record<PrivateCallEndReason, { icon: IconName; color: ColorKey }> =
  {
    declined: { icon: "phone-off", color: "danger" },
    cancelled: { icon: "phone-missed", color: "danger" },
    missed: { icon: "phone-missed", color: "danger" },
    hangup: { icon: "phone", color: "textMuted" },
    disconnected: { icon: "wifi-off", color: "highlight" },
  };
const ERROR_ICON: { icon: IconName; color: ColorKey } = {
  icon: "alert-triangle",
  color: "highlight",
};

export function PrivateCallNotice() {
  const colors: ThemeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const privateCall = useOptionalPrivateCall();
  const notice =
    privateCall?.state.phase === "idle" ? privateCall.state.notice : null;
  const dismiss = privateCall?.dismissNotice;

  useEffect(() => {
    if (!notice || !dismiss) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  if (!notice || !dismiss) return null;
  const { icon, color } = privateCall?.endReason
    ? ICONS[privateCall.endReason]
    : ERROR_ICON;

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 items-center px-4"
      style={{ top: insets.top + 8 }}
    >
      <View
        accessibilityRole="alert"
        className="w-full max-w-md flex-row items-center gap-3 rounded-xl border border-line-strong bg-surface-raised px-4 py-3"
        style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)" }}
      >
        <Feather name={icon} size={16} color={colors[color]} />
        <Text className="flex-1 text-[14px] text-content">{notice}</Text>
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
        >
          <Feather name="x" size={14} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
