import {
  premiumActions,
  premiumCancelConfirmation,
  premiumStatusCopy,
  type PremiumView,
  type ThemeColors,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../../theme/theme-context";
import { cancelPremium } from "../../api";
import { BILLING_COPY } from "../../billingCopy";
import { CancelPremiumModal } from "./CancelPremiumModal";
import { PlanCard } from "../shared/PlanCard";
import { PremiumSubscribeButton } from "../shared/PremiumSubscribeButton";

function stateColor(state: PremiumView["state"], colors: ThemeColors): string {
  switch (state) {
    case "active":
      return colors.success;
    case "processing_first_payment":
    case "active_canceled":
      return colors.warning;
    case "expired":
      return colors.danger;
    case "none":
      return colors.textSubtle;
  }
}

interface PremiumCardProps {
  premium: PremiumView;
  onSubscribe: () => void;
  onChanged: (premium: PremiumView) => void;
  onShowPlan: () => void;
}

export function PremiumCard({
  premium,
  onSubscribe,
  onChanged,
  onShowPlan,
}: PremiumCardProps) {
  const colors = useThemeColors();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actions = premiumActions(premium);
  const copy = premiumStatusCopy(premium);
  const cancelLabel =
    premium.state === "active"
      ? BILLING_COPY.cancelRenewal
      : BILLING_COPY.cancelSubscription;

  async function cancel() {
    setIsConfirmOpen(false);
    setIsCancelling(true);
    setError(null);
    const result = await cancelPremium();
    setIsCancelling(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onChanged(result.data);
  }

  return (
    <View className="gap-3">
      <PlanCard
        status={{ label: copy.label, color: stateColor(premium.state, colors) }}
        detail={copy.detail}
        actions={
          actions.canSubscribe || actions.canCancel ? (
            <>
              {actions.canSubscribe ? (
                <PremiumSubscribeButton
                  label={
                    premium.state === "expired"
                      ? BILLING_COPY.resubscribe
                      : BILLING_COPY.subscribeCta
                  }
                  onPress={onSubscribe}
                />
              ) : null}
              {actions.canCancel ? (
                <Button
                  title={cancelLabel}
                  variant="secondary"
                  isLoading={isCancelling}
                  onPress={() => setIsConfirmOpen(true)}
                />
              ) : null}
            </>
          ) : null
        }
      />

      <FormErrorBanner message={error} />

      {premium.state === "none" ? (
        <View className="flex-row flex-wrap items-center gap-1">
          <Text className="text-[14px] text-content-muted">
            {BILLING_COPY.noSubscription}
          </Text>
          <TouchableOpacity onPress={onShowPlan} accessibilityRole="link">
            <Text className="text-[14px] font-semibold text-accent-strong">
              {BILLING_COPY.discoverPremium}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <CancelPremiumModal
        visible={isConfirmOpen}
        body={premiumCancelConfirmation(
          actions.benefitsActive ? premium.premium_until : null,
        )}
        confirmLabel={cancelLabel}
        onConfirm={() => void cancel()}
        onClose={() => setIsConfirmOpen(false)}
      />
    </View>
  );
}
