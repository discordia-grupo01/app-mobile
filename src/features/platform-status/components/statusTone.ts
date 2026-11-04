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

function mixHex(color: string, base: string, amount: number): string {
  const channel = (hex: string, index: number) =>
    parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const mixed = [0, 1, 2].map((index) =>
    Math.round(
      channel(color, index) * amount + channel(base, index) * (1 - amount),
    )
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${mixed.join("")}`;
}

/** Cuánto color de estado lleva la barra; igual que `--color-status-bar-*` en web. */
const STATUS_BAR_MIX: Record<PlatformStatus, number> = {
  operational: 0.4,
  degraded: 0.6,
  maintenance: 0.8,
};

/**
 * Fondo opaco de la barra de aviso: el color transparente sobre el fondo
 * azulado se ve oliva. Es el color de estado aclarado, con texto oscuro encima.
 */
export function statusBarBackground(
  status: PlatformStatus,
  colors: ThemeColors,
): string {
  return mixHex(
    STATUS_TONES[status].color(colors),
    "#ffffff",
    STATUS_BAR_MIX[status],
  );
}

export const STATUS_BAR_INK = "rgba(0, 0, 0, 0.82)";

export const STATUS_BAR_LINK_LINE = "rgba(0, 0, 0, 0.35)";
