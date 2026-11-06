import { Text, View } from "react-native";

import { withAlpha } from "../../../../lib/color";
import { BILLING_COPY } from "../../billingCopy";
import { DiscordiaPremiumBadge, LOGO } from "./DiscordiaIcons";

export function PremiumPill() {
  return (
    <View
      accessible
      accessibilityLabel={BILLING_COPY.premiumPillLabel}
      className="flex-row items-center gap-1 self-start rounded-full border px-2 py-1"
      style={{
        borderColor: withAlpha(LOGO.yellow, 0.3),
        backgroundColor: withAlpha(LOGO.yellow, 0.1),
      }}
    >
      <DiscordiaPremiumBadge size={14} />
      <Text
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: LOGO.yellow }}
      >
        {BILLING_COPY.premiumPill}
      </Text>
    </View>
  );
}
