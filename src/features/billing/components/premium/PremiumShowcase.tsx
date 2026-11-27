import {
  BILLING_COPY,
  formatMemberSince,
  PREMIUM_BRAND_COLORS,
  PREMIUM_SHOWCASE_BENEFITS,
  premiumActions,
  premiumStatusCopy,
  type PremiumView,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { PlanCard, type PlanStatus } from "../shared/PlanCard";
import { PremiumFacts } from "../shared/PremiumFacts";
import { PremiumSubscribeButton } from "../shared/PremiumSubscribeButton";
import {
  type PremiumArtProfile,
  PremiumShowcaseArt,
} from "./PremiumShowcaseArt";
import { SettingsGroupLabel } from "../../../../components/ui/SettingsGroup";

interface PremiumShowcaseProps {
  premium: PremiumView;
  profile: PremiumArtProfile | null;
  onManage: () => void;
}

export function PremiumShowcase({
  premium,
  profile,
  onManage,
}: PremiumShowcaseProps) {
  const actions = premiumActions(premium);
  const status: PlanStatus | null = actions.canSubscribe
    ? null
    : {
        label:
          actions.benefitsActive && premium.premium_until
            ? BILLING_COPY.activeUntil(formatMemberSince(premium.premium_until))
            : premiumStatusCopy(premium).label,
        tone: actions.benefitsActive ? "success" : "muted",
      };

  return (
    <View className="gap-6">
      <View>
        <Text className="text-[20px] font-bold text-content">
          {BILLING_COPY.planTitle}
        </Text>
        <Text className="mt-1.5 text-[14px] leading-[20px] text-content-muted">
          {BILLING_COPY.planSubtitle}
        </Text>
      </View>

      <PlanCard
        status={status}
        actions={
          actions.canSubscribe ? (
            <PremiumSubscribeButton
              label={BILLING_COPY.subscribeCta}
              onPress={onManage}
            />
          ) : (
            <Button
              title={BILLING_COPY.manage}
              variant="secondary"
              onPress={onManage}
            />
          )
        }
      />

      <View className="gap-3">
        <SettingsGroupLabel>{BILLING_COPY.benefitsTitle}</SettingsGroupLabel>
        {PREMIUM_SHOWCASE_BENEFITS.map((benefit) => (
          <View
            key={benefit.id}
            className="rounded-2xl border bg-surface-raised p-3.5"
            style={{ borderColor: PREMIUM_BRAND_COLORS.yellow }}
          >
            <PremiumShowcaseArt benefit={benefit.id} profile={profile} />
            <Text className="mt-3 text-[16px] font-bold text-content">
              {benefit.title}
            </Text>
            <Text className="mt-1 text-[14px] leading-[20px] text-content-muted">
              {benefit.description}
            </Text>
          </View>
        ))}
      </View>

      <PremiumFacts />
    </View>
  );
}
