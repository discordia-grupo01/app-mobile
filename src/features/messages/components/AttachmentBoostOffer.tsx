import {
  ATTACHMENT_BOOST_OFFER_COPY,
  type BoostLevel,
} from "@discordia/client-shared";
import { Text, TouchableOpacity, View } from "react-native";

import { PremiumTextLink } from "../../billing/components/shared/PremiumTextLink";
import { BoostBenefitChip } from "../../boosts/components/BoostBenefitChip";

interface AttachmentBoostOfferProps {
  level: BoostLevel;
  boostCount: number;
  onShowBenefits: () => void;
  onOpenPremium: () => void;
}

export function AttachmentBoostOffer({
  level,
  boostCount,
  onShowBenefits,
  onOpenPremium,
}: AttachmentBoostOfferProps) {
  return (
    <View className="mt-2 gap-1.5 rounded-xl border border-line bg-surface-modal p-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-[13px] font-bold text-content">
          {ATTACHMENT_BOOST_OFFER_COPY.title}
        </Text>
        <BoostBenefitChip
          perk="larger_attachments"
          level={level}
          boostCount={boostCount}
        />
      </View>
      <Text className="text-xs leading-[17px] text-content-muted">
        {ATTACHMENT_BOOST_OFFER_COPY.detail}
      </Text>
      <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <TouchableOpacity
          onPress={onShowBenefits}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text className="text-xs font-semibold text-info">
            {ATTACHMENT_BOOST_OFFER_COPY.benefits}
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-content-subtle">
            {ATTACHMENT_BOOST_OFFER_COPY.premiumLead}
          </Text>
          <PremiumTextLink
            label={ATTACHMENT_BOOST_OFFER_COPY.premium}
            onPress={onOpenPremium}
          />
        </View>
      </View>
    </View>
  );
}
