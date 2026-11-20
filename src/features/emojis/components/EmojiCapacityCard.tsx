import {
  type BoostLevel,
  emojiCapacityTitleFor,
  emojiSlotsHint,
  emojiSlotsTotalLabel,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { BoostBenefitChip } from "../../boosts/components/BoostBenefitChip";
import { SettingsGroupLabel } from "../../../components/ui/SettingsGroup";

interface EmojiCapacityCardProps {
  serverName: string;
  used: number;
  max: number;
  level: BoostLevel;
  boostCount: number;
}

export function EmojiCapacityCard({
  serverName,
  used,
  max,
  level,
  boostCount,
}: EmojiCapacityCardProps) {
  const ratio = max > 0 ? Math.min(1, used / max) : 1;
  const isFull = used >= max;
  const title = emojiCapacityTitleFor(serverName);

  return (
    <View className="rounded-2xl border border-line bg-surface-raised p-4">
      <View className="flex-row items-baseline justify-between">
        <SettingsGroupLabel>{title}</SettingsGroupLabel>
        <View className="flex-row items-baseline gap-1">
          <Text className="font-display text-[26px] font-bold text-content">
            {used}
          </Text>
          <Text className="text-[13px] font-medium text-content-muted">
            {emojiSlotsTotalLabel(max)}
          </Text>
        </View>
      </View>

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max, now: used }}
        className="my-3 h-2 w-full overflow-hidden rounded-full bg-surface-input"
      >
        <View
          style={{ width: `${Math.round(ratio * 100)}%` }}
          className={cn(
            "h-full rounded-full",
            isFull ? "bg-warning" : "bg-accent",
          )}
        />
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <BoostBenefitChip
          perk="extra_emoji_slots"
          level={level}
          boostCount={boostCount}
        />
        <Text className="text-[12px] text-content-subtle">
          {emojiSlotsHint(level)}
        </Text>
      </View>
    </View>
  );
}
