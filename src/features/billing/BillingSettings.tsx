import {
  BILLING_BOOSTS_COPY,
  BILLING_COPY,
  type BillingSection,
  type CheckoutItem,
  formatPoints,
  PAYMENT_RETURN_SECTION,
  type PaymentReturnParams,
  PREMIUM_PRICE_CENTS,
  type PremiumView,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { FormErrorBanner } from "../../components/ui/FormErrorBanner";
import { useAuth } from "../auth/auth-context";
import { getOwnProfile } from "../profile/service";
import { useBillingOverview } from "./useBillingOverview";
import { useCheckout } from "./components/checkout/useCheckout";
import { BoostsTab } from "./components/boosts/BoostsTab";
import { BillingHistory } from "./components/history/BillingHistory";
import { BillingSectionHeader } from "./components/shared/BillingSectionHeader";
import { CheckoutConfirmModal } from "./components/checkout/CheckoutConfirmModal";
import { DiscordiaPointIcon } from "./components/shared/DiscordiaIcons";
import { PaymentResultModal } from "./components/payment-result/PaymentResultModal";
import { PointsShop } from "./components/points/PointsShop";
import { PremiumCard } from "./components/subscriptions/PremiumCard";
import { PremiumFacts } from "./components/shared/PremiumFacts";
import { PremiumShowcase } from "./components/premium/PremiumShowcase";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

interface BillingSettingsProps {
  tab: BillingSection;
  onNavigate: (tab: BillingSection) => void;
  /** "Gestionar" en Boosts de servidor: cierra la cuenta y abre la sección Boosts. */
  onOpenServerBoosts: (serverId: string) => void;
}

export function BillingSettings({
  tab,
  onNavigate,
  onOpenServerBoosts,
}: BillingSettingsProps) {
  const { user, updateUser } = useAuth();
  const { state, reload, setPremium } = useBillingOverview();
  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [payment, setPayment] = useState<PaymentReturnParams | null>(null);
  const isReady = state.status === "ready";

  const refreshOwnProfile = useCallback(async () => {
    const result = await getOwnProfile();
    if (result.ok) updateUser(result.user);
  }, [updateUser]);

  useEffect(() => {
    if (isReady) void refreshOwnProfile();
  }, [isReady, refreshOwnProfile]);

  const handleReturned = useCallback((returned: PaymentReturnParams) => {
    setItem(null);
    setPayment(returned);
  }, []);

  const checkout = useCheckout(handleReturned);

  function closeCheckout() {
    setItem(null);
    checkout.reset();
  }

  function openCheckout(next: CheckoutItem) {
    checkout.reset();
    setItem(next);
  }

  function closePayment(returned: PaymentReturnParams) {
    setPayment(null);
    onNavigate(PAYMENT_RETURN_SECTION[returned.kind]);
    reload();
    void refreshOwnProfile();
  }

  function changePremium(premium: PremiumView) {
    setPremium(premium);
    void refreshOwnProfile();
  }

  if (state.status === "loading") {
    return <LoadingSpinner label={BILLING_COPY.loading} />;
  }

  if (state.status === "error") {
    return (
      <View className="gap-2">
        <FormErrorBanner message={state.message} />
        <Button
          title={BILLING_COPY.retry}
          variant="secondary"
          onPress={reload}
        />
      </View>
    );
  }

  return (
    <View className="gap-6">
      {tab === "premium" ? (
        <PremiumShowcase
          premium={state.premium}
          profile={user}
          onManage={() => onNavigate("subscriptions")}
        />
      ) : null}

      {tab === "subscriptions" ? (
        <>
          <BillingSectionHeader
            title={BILLING_COPY.subscriptionsTitle}
            subtitle={BILLING_COPY.subscriptionsSubtitle}
          />
          <PremiumCard
            premium={state.premium}
            onSubscribe={() =>
              openCheckout({ kind: "premium", priceCents: PREMIUM_PRICE_CENTS })
            }
            onChanged={changePremium}
            onShowPlan={() => onNavigate("premium")}
          />
          <PremiumFacts />
        </>
      ) : null}

      {tab === "points" ? (
        <>
          <BillingSectionHeader
            title={BILLING_COPY.pointsTitle}
            subtitle={BILLING_COPY.pointsSubtitle}
          />
          <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface-raised p-4">
            <DiscordiaPointIcon size={32} />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-content">
                {BILLING_COPY.balanceLabel}
              </Text>
              <Text className="mt-0.5 text-[22px] font-bold text-content tabular-nums">
                {formatPoints(Math.max(0, state.points.balance))}
              </Text>
            </View>
          </View>
          <PointsShop
            packages={state.packages}
            onShowBoosts={() => onNavigate("boosts")}
            onBuy={(pack) =>
              openCheckout({
                kind: "points",
                packageId: pack.id,
                points: pack.points,
                priceCents: pack.price_cents,
              })
            }
          />
        </>
      ) : null}

      {tab === "boosts" ? (
        <>
          <BillingSectionHeader
            title={BILLING_BOOSTS_COPY.title}
            subtitle={BILLING_BOOSTS_COPY.subtitle}
          />
          <BoostsTab
            onBuyPoints={() => onNavigate("points")}
            onManageServer={onOpenServerBoosts}
          />
        </>
      ) : null}

      {tab === "transactions" ? (
        <>
          <BillingSectionHeader
            title={BILLING_COPY.transactionsTitle}
            subtitle={BILLING_COPY.transactionsSubtitle}
          />
          <BillingHistory
            purchases={state.points.purchases}
            ledger={state.points.ledger}
          />
        </>
      ) : null}

      <CheckoutConfirmModal
        item={item}
        defaultEmail={user?.email ?? ""}
        pending={checkout.pending}
        error={checkout.error}
        onConfirm={(email) => {
          if (item) void checkout.start(item, email);
        }}
        onClose={closeCheckout}
      />

      <PaymentResultModal payment={payment} onClose={closePayment} />
    </View>
  );
}
