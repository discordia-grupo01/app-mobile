import {
  BOOST_ACTION_COPY,
  BOOST_COST_POINTS,
  boostPointsMissingLabel,
  canAffordBoost,
} from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { DiscordiaPointIcon } from "../../../billing/components/shared/DiscordiaIcons";
import { BoostActionIcon } from "../BoostActionIcon";

interface BoostActionCardProps {
  balance: number;
  onBoost: () => void;
  onBuyPoints: () => void;
}

function PointsFact({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 rounded-xl bg-surface-input px-3 py-1.5">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-content-subtle">
        {label}
      </Text>
      <View className="flex-row items-center gap-1">
        <DiscordiaPointIcon size={14} />
        <Text className="font-display text-sm font-bold text-content tabular-nums">
          {value}
        </Text>
      </View>
    </View>
  );
}

export function BoostActionCard({
  balance,
  onBoost,
  onBuyPoints,
}: BoostActionCardProps) {
  const canAfford = canAffordBoost(balance);

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface-raised">
      <View className="gap-3.5 p-4">
        <View className="flex-row items-start gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-input">
            <BoostActionIcon size={20} />
          </View>
          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="font-display text-sm font-bold text-content"
            >
              {BOOST_ACTION_COPY.title}
            </Text>
            <Text className="mt-0.5 text-xs leading-[17px] text-content-muted">
              {BOOST_ACTION_COPY.description}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <PointsFact
            label={BOOST_ACTION_COPY.costLabel}
            value={BOOST_COST_POINTS}
          />
          <PointsFact label={BOOST_ACTION_COPY.balanceLabel} value={balance} />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBoost}
          disabled={!canAfford}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canAfford }}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5",
            !canAfford && "opacity-50",
          )}
        >
          <View className="h-5.5 w-5.5 items-center justify-center rounded-md bg-surface-modal">
            <BoostActionIcon size={16} />
          </View>
          <Text className="font-display text-sm font-bold text-on-accent">
            {BOOST_ACTION_COPY.cta}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className={cn(
          "flex-row items-center justify-between gap-3 border-t px-4 py-2.5",
          canAfford
            ? "border-line bg-surface-input"
            : "border-line bg-danger-soft",
        )}
      >
        <Text
          className={cn(
            "flex-1 text-xs",
            canAfford ? "text-content-muted" : "font-semibold text-danger",
          )}
        >
          {canAfford
            ? BOOST_ACTION_COPY.moreBoosts
            : boostPointsMissingLabel(balance)}
        </Text>
        <TouchableOpacity
          onPress={onBuyPoints}
          accessibilityRole="link"
          hitSlop={8}
        >
          <Text className="text-xs font-semibold text-accent-strong">
            {BOOST_ACTION_COPY.buyPoints}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
