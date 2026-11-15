import {
  BOOST_ACTION_COPY,
  BOOST_COST_POINTS,
  type BoostBlockReason,
  boostCapNote,
  boostPointsMissingLabel,
  MAX_BOOST_LEVEL,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";

import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { DiscordiaPointIcon } from "../../../billing/components/shared/DiscordiaIcons";
import { BoostActionIcon } from "../BoostActionIcon";
import { BoostLevelIcon } from "../BoostLevelIcon";

interface BoostActionCardProps {
  serverName: string;
  balance: number;
  blockReason: BoostBlockReason | null;
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
  serverName,
  balance,
  blockReason,
  onBoost,
  onBuyPoints,
}: BoostActionCardProps) {
  const colors = useThemeColors();
  const blocked = blockReason !== null;
  const capReached = blockReason === "cap";

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
          disabled={blocked}
          accessibilityRole="button"
          accessibilityState={{ disabled: blocked }}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5",
            blocked && "opacity-50",
          )}
        >
          {capReached ? (
            <BoostLevelIcon level={MAX_BOOST_LEVEL} size={18} bare onAccent />
          ) : (
            <View className="h-5.5 w-5.5 items-center justify-center rounded-md bg-surface-modal">
              <BoostActionIcon size={16} />
            </View>
          )}
          <Text className="font-display text-sm font-bold text-on-accent">
            {capReached ? BOOST_ACTION_COPY.capCta : BOOST_ACTION_COPY.cta}
          </Text>
        </TouchableOpacity>
      </View>

      {capReached ? (
        <View className="flex-row items-center gap-2.5 border-t border-line bg-surface-input px-4 py-2.5">
          <Feather name="info" size={16} color={colors.textMuted} />
          <Text className="flex-1 text-xs text-content-muted">
            {boostCapNote(serverName)}
          </Text>
        </View>
      ) : (
        <View
          className={cn(
            "flex-row items-center justify-between gap-3 border-t px-4 py-2.5",
            blockReason === "balance"
              ? "border-boost-warn-line bg-boost-warn-soft"
              : "border-line bg-surface-input",
          )}
        >
          <Text
            className={cn(
              "flex-1 text-xs",
              blockReason === "balance"
                ? "font-semibold text-boost-warn"
                : "text-content-muted",
            )}
          >
            {blockReason === "balance"
              ? boostPointsMissingLabel(balance)
              : BOOST_ACTION_COPY.moreBoosts}
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
      )}
    </View>
  );
}
