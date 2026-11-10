import {
  BILLING_COPY,
  formatArsFromCents,
  PREMIUM_BRAND_COLORS,
  PREMIUM_PRICE_CENTS,
} from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { withAlpha } from "../../../../lib/color";
import { DiscordiaPremiumMark } from "./DiscordiaIcons";

interface PlanCardProps {
  status?: { label: string; color: string } | null;
  detail?: string;
  actions?: ReactNode;
}

/**
 * Tarjeta del plan pensada para el ancho de un celular: todo apilado, con el
 * precio grande y el estado en su propia línea para que no se corte.
 */
export function PlanCard({ status, detail, actions }: PlanCardProps) {
  return (
    <View
      className="rounded-2xl border bg-surface-raised p-4"
      style={{ borderColor: withAlpha(PREMIUM_BRAND_COLORS.yellow, 0.35) }}
    >
      <DiscordiaPremiumMark size={56} />

      <Text className="mt-3 text-[19px] font-bold text-content">
        {BILLING_COPY.premiumTitle}
      </Text>

      {status ? (
        <View className="mt-1.5 flex-row items-center gap-2">
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <Text
            className="flex-1 text-[13px] font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
      ) : null}

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
