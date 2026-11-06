import {
  type PaymentOutcome,
  paymentOutcomeCopy,
  type PaymentReturnParams,
  type ThemeColors,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { BILLING_COPY } from "../../billingCopy";
import { usePaymentResult } from "./usePaymentResult";

type Tone = "progress" | "success" | "warning" | "danger";

const TONE: Record<PaymentOutcome, Tone> = {
  verifying: "progress",
  points_accredited: "success",
  premium_active: "success",
  points_pending: "warning",
  premium_processing: "warning",
  points_rejected: "danger",
  points_expired: "danger",
  points_reversed: "danger",
  points_not_found: "danger",
  premium_not_activated: "danger",
};

const TONE_ICON: Record<
  Exclude<Tone, "progress">,
  "check-circle" | "alert-circle" | "x-circle"
> = {
  success: "check-circle",
  warning: "alert-circle",
  danger: "x-circle",
};

function toneColor(tone: Tone, colors: ThemeColors): string {
  switch (tone) {
    case "progress":
      return colors.info;
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "danger":
      return colors.danger;
  }
}

interface PaymentResultModalProps {
  payment: PaymentReturnParams | null;
  onClose: (payment: PaymentReturnParams) => void;
}

/** Lo que en web es la pantalla `/billing/return`: verifica el pago al volver de MP. */
export function PaymentResultModal({
  payment,
  onClose,
}: PaymentResultModalProps) {
  return (
    <ModalShell
      visible={payment !== null}
      onClose={() => {
        if (payment) onClose(payment);
      }}
      dismissOnBackdrop={false}
      className="max-w-[420px] items-center px-6 py-8"
    >
      {payment ? (
        <PaymentResultContent
          payment={payment}
          onClose={() => onClose(payment)}
        />
      ) : null}
    </ModalShell>
  );
}

function PaymentResultContent({
  payment,
  onClose,
}: {
  payment: PaymentReturnParams;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const result = usePaymentResult(payment);
  const { outcome, done } = result.progress;
  const tone = TONE[outcome];
  const color = toneColor(tone, colors);
  const copy = paymentOutcomeCopy(outcome, {
    points: result.purchase?.points,
    balance: result.balance ?? undefined,
    statusDetail: result.purchase?.status_detail,
    premiumUntil: result.premium?.premium_until,
  });

  return (
    <>
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
        {BILLING_COPY.resultTitle}
      </Text>
      <View
        className="mb-4 mt-5 h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: withAlpha(color, 0.15) }}
      >
        {tone === "progress" ? (
          <ActivityIndicator color={color} />
        ) : (
          <Feather name={TONE_ICON[tone]} size={30} color={color} />
        )}
      </View>
      <View accessibilityLiveRegion="polite" className="mb-5 items-center">
        <Text className="mb-2 text-center text-[19px] font-bold text-content">
          {copy.title}
        </Text>
        <Text className="text-center text-[14px] leading-5 text-content-muted">
          {copy.description}
        </Text>
      </View>

      <View className="w-full">
        <FormErrorBanner message={result.error} />
      </View>

      <View className="w-full gap-2.5">
        {result.error ? (
          <Button
            title={BILLING_COPY.retry}
            variant="secondary"
            onPress={result.retry}
          />
        ) : null}
        <Button
          title={done ? BILLING_COPY.backToBilling : BILLING_COPY.close}
          variant={done ? "primary" : "secondary"}
          onPress={onClose}
        />
      </View>
    </>
  );
}
