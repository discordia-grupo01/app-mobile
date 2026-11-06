import {
  formatMemberSince,
  premiumActions,
  premiumStatusCopy,
  type PremiumView,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import {
  BILLING_COPY,
  PREMIUM_SHOWCASE_BENEFITS,
  type PremiumBenefitId,
} from "../../billingCopy";
import { DiscordiaPremiumBadge, LOGO } from "../shared/DiscordiaIcons";
import { PlanCard } from "../shared/PlanCard";
import { PremiumFacts } from "../shared/PremiumFacts";
import { PremiumPill } from "../shared/PremiumPill";
import { PremiumSubscribeButton } from "../shared/PremiumSubscribeButton";

const BENEFIT_ICON: Record<
  Exclude<PremiumBenefitId, "badge">,
  keyof typeof Feather.glyphMap
> = {
  attachments: "paperclip",
  animated: "film",
  "global-emojis": "smile",
};

interface PremiumShowcaseProps {
  premium: PremiumView;
  onManage: () => void;
}

export function PremiumShowcase({ premium, onManage }: PremiumShowcaseProps) {
  const colors = useThemeColors();
  const actions = premiumActions(premium);
  const status = actions.canSubscribe
    ? null
    : {
        label:
          actions.benefitsActive && premium.premium_until
            ? BILLING_COPY.activeUntil(formatMemberSince(premium.premium_until))
            : premiumStatusCopy(premium).label,
        color: actions.benefitsActive ? colors.success : colors.textSubtle,
      };
  const benefitColor = actions.benefitsActive ? colors.success : LOGO.yellow;

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
        <Text className="px-1 text-[11px] font-bold uppercase tracking-[1.4px] text-content-subtle">
          {BILLING_COPY.benefitsTitle}
        </Text>
        {PREMIUM_SHOWCASE_BENEFITS.map((benefit) => (
          <View
            key={benefit.id}
            className="rounded-2xl border border-line bg-surface-raised p-4"
          >
            <View className="flex-row items-center gap-3">
              {benefit.id === "badge" ? (
                <View className="h-11 w-11 items-center justify-center">
                  <DiscordiaPremiumBadge size={42} />
                </View>
              ) : (
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: withAlpha(benefitColor, 0.15) }}
                >
                  <Feather
                    name={BENEFIT_ICON[benefit.id]}
                    size={20}
                    color={benefitColor}
                  />
                </View>
              )}
              <Text className="flex-1 text-[16px] font-bold text-content">
                {benefit.title}
              </Text>
            </View>
            <Text className="mt-2 text-[14px] leading-[20px] text-content-muted">
              {benefit.description}
            </Text>
            {benefit.id === "badge" ? (
              <View className="mt-3">
                <PremiumPill />
              </View>
            ) : null}
            {benefit.id === "attachments" ? (
              <View className="mt-3 flex-row items-center gap-2">
                <Text className="text-[13px] text-content-subtle line-through tabular-nums">
                  10 MB
                </Text>
                <Feather
                  name="arrow-right"
                  size={14}
                  color={colors.textSubtle}
                />
                <Text
                  className="text-[15px] font-bold tabular-nums"
                  style={{ color: LOGO.yellow }}
                >
                  50 MB
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <PremiumFacts />
    </View>
  );
}
