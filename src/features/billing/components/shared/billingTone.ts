import type { BillingTone, ThemeColors } from "@discordia/client-shared";

export function billingToneColor(
  tone: BillingTone,
  colors: ThemeColors,
): string {
  switch (tone) {
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "danger":
      return colors.danger;
    case "info":
      return colors.info;
    case "muted":
      return colors.textSubtle;
  }
}
