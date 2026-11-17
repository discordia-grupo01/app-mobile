import {
  BILLING_COPY,
  type BillingTone,
  formatArsFromCents,
  PREMIUM_BRAND_COLORS,
  PREMIUM_PRICE_CENTS,
} from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useTheme, useThemeColors } from "../../../../theme/theme-context";
import { billingToneBackground, billingToneColor } from "./billingTone";
import { DiscordiaPremiumMark } from "./DiscordiaIcons";

export interface PlanStatus {
  label: string;
  tone: BillingTone;
}

interface PlanCardProps {
  status?: PlanStatus | null;
  detail?: string;
  actions?: ReactNode;
}

/**
 * Tarjeta del plan pensada para el ancho de un celular: todo apilado, con el
 * precio grande y el estado como chip debajo del título, igual que en web.
 */
export function PlanCard({ status, detail, actions }: PlanCardProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();

  return (
    <View
      className="rounded-2xl bg-surface-raised p-4"
      style={{
        borderColor: PREMIUM_BRAND_COLORS.yellow,
        borderWidth: theme === "light" ? 1.5 : 1,
      }}
    >
      <View className="flex-row items-center gap-3">
        <DiscordiaPremiumMark size={56} />
        <View className="flex-1 items-start gap-1.5">
          <Text className="text-[19px] font-bold text-content">
            {BILLING_COPY.premiumTitle}
          </Text>
          {status ? (
            <View
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: billingToneBackground(status.tone, colors),
              }}
            >
              <Text
                className="text-[10px] font-bold uppercase"
                style={{ color: billingToneColor(status.tone, colors) }}
              >
                {status.label}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-3 flex-row items-baseline gap-1.5">
        <Text className="text-[26px] font-bold text-content tabular-nums">
          {formatArsFromCents(PREMIUM_PRICE_CENTS)}
        </Text>
        <Text className="text-[14px] text-content-muted">
          {BILLING_COPY.perMonthPlain}
        </Text>
      </View>

      {detail ? (
        <Text className="mt-2 text-[14px] leading-[20px] text-content-muted">
          {detail}
        </Text>
      ) : null}

      {actions ? <View className="mt-4 gap-2.5">{actions}</View> : null}
    </View>
  );
}
