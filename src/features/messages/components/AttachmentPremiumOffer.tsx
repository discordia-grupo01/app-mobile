import {
  ATTACHMENT_PREMIUM_OFFER_COPY,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { PremiumTextLink } from "../../billing/components/shared/PremiumTextLink";

interface AttachmentPremiumOfferProps {
  onOpenPremium: () => void;
}

export function AttachmentPremiumOffer({
  onOpenPremium,
}: AttachmentPremiumOfferProps) {
  return (
    <View
      className="mt-2 gap-1.5 rounded-xl border bg-surface-modal p-3"
      style={{ borderColor: withAlpha(PREMIUM_BRAND_COLORS.yellow, 0.3) }}
    >
      <Text className="text-[13px] font-bold text-content">
        {ATTACHMENT_PREMIUM_OFFER_COPY.title}
      </Text>
      <Text className="text-xs leading-[17px] text-content-muted">
        {ATTACHMENT_PREMIUM_OFFER_COPY.detail}
      </Text>
      <View className="flex-row">
        <PremiumTextLink
          label={ATTACHMENT_PREMIUM_OFFER_COPY.cta}
          onPress={onOpenPremium}
        />
      </View>
    </View>
  );
}
