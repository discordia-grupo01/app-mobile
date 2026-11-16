import type { PlatformStatus, ThemeColors } from "@discordia/client-shared";
import type { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";

interface StatusTone {
  icon: ComponentProps<typeof Feather>["name"];
  color: (colors: ThemeColors) => string;
}

export const STATUS_TONES: Record<PlatformStatus, StatusTone> = {
  operational: {
    icon: "check-circle",
    color: (colors) => colors.success,
  },
  degraded: {
    icon: "alert-triangle",
    color: (colors) => colors.warning,
  },
  maintenance: {
    icon: "tool",
    color: (colors) => colors.info,
  },
};
