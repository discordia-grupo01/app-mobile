import { BILLING_COPY, PREMIUM_BRAND_COLORS } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { withAlpha } from "../../../../lib/color";
import { DiscordiaPremiumBadge } from "./DiscordiaIcons";

export function PremiumPill() {
  return (
    <View
      accessible
      accessibilityLabel={BILLING_COPY.premiumPillLabel}
      className="flex-row items-center gap-1 rounded-full border px-2 py-1"
      style={{
        borderColor: withAlpha(PREMIUM_BRAND_COLORS.yellow, 0.3),
        backgroundColor: withAlpha(PREMIUM_BRAND_COLORS.yellow, 0.1),
      }}
    >
      <DiscordiaPremiumBadge size={14} />
      <Text
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: PREMIUM_BRAND_COLORS.yellow }}
      >
        {BILLING_COPY.premiumPill}
      </Text>
    </View>
  );
}
