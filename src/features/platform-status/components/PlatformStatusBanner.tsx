import {
  HIDE_STATUS_NOTICE_LABEL,
  type Incident,
  type PlatformStatus,
  statusNoticeText,
  VIEW_PLATFORM_STATUS_LABEL,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { useTheme, useThemeColors } from "../../../theme/theme-context";
import { STATUS_TONES } from "./statusTone";

export const STATUS_BANNER_HEIGHT = 40;

interface PlatformStatusBannerProps {
  status: PlatformStatus;
  incidents: readonly Incident[];
  top: number;
  onOpenDetails: () => void;
  onHide: () => void;
}

/** Barra bajo la barra de estado del sistema, mientras haya incidentes activos. */
export function PlatformStatusBanner({
  status,
  incidents,
  top,
  onOpenDetails,
  onHide,
}: PlatformStatusBannerProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const tone = STATUS_TONES[status];
  const mutedInk = withAlpha(colors.onAccent, 0.7);

  return (
    <View
      className="absolute inset-x-0 flex-row items-center bg-surface-servers pl-3.5 pr-1"
      style={{
        top,
        height: STATUS_BANNER_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor:
          theme === "light" ? colors.borderOnAccent : colors.border,
      }}
    >
      <Pressable
        className="flex-1 flex-row items-center gap-2"
        onPress={onOpenDetails}
        accessibilityRole="button"
        accessibilityLabel={`${statusNoticeText(incidents)}. ${VIEW_PLATFORM_STATUS_LABEL}`}
      >
        <Feather name={tone.icon} size={15} color={tone.color(colors)} />
        <Text
          className="flex-shrink text-[13px] font-semibold text-on-accent"
          numberOfLines={1}
        >
          {statusNoticeText(incidents)}
        </Text>
        <View
          style={{
            paddingTop: 3,
            paddingBottom: 2,
            borderBottomWidth: 1,
            borderBottomColor: withAlpha(colors.onAccent, 0.4),
          }}
        >
          <Text className="text-[13px] font-medium" style={{ color: mutedInk }}>
            {VIEW_PLATFORM_STATUS_LABEL}
          </Text>
        </View>
      </Pressable>
      <TouchableOpacity
        className="h-9 w-9 items-center justify-center"
        onPress={onHide}
        accessibilityRole="button"
        accessibilityLabel={HIDE_STATUS_NOTICE_LABEL}
      >
        <Feather name="x" size={16} color={mutedInk} />
      </TouchableOpacity>
    </View>
  );
}
