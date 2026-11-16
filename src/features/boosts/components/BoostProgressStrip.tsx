import {
  BOOST_LEVEL_THRESHOLDS,
  type BoostLevel,
  boostCountLabel,
  boostLevelLabel,
  boostsUntilLevelLabel,
  nextBoostLevel,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { BoostLevelIcon } from "./BoostLevelIcon";
import { BoostProgressBar } from "./BoostProgressBar";
import { BoostServerButton } from "./BoostServerButton";

interface BoostProgressStripProps {
  level: BoostLevel;
  boostCount: number;
  onBoost?: () => void;
  compact?: boolean;
}

export function BoostProgressStrip({
  level,
  boostCount,
  onBoost,
  compact = false,
}: BoostProgressStripProps) {
  const next = nextBoostLevel(level);
  if (next === undefined) return null;

  const target = BOOST_LEVEL_THRESHOLDS[next - 1];
  const progress = boostsUntilLevelLabel(next, boostCount);
  const count = `${Math.min(boostCount, target)}/${target}`;

  if (compact) {
    return (
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <BoostProgressBar
            boostCount={boostCount}
            target={target}
            label={progress}
          />
        </View>
        <Text className="text-[11px] text-content-subtle">{count}</Text>
      </View>
    );
  }

  return (
    <View className="gap-2.5 rounded-xl border border-line bg-surface-raised px-3 py-2.5">
      <View className="flex-row items-center gap-3">
        <BoostLevelIcon level={level} size={24} />
        <View className="flex-1">
          <View className="mb-1.5 flex-row justify-between gap-3">
            <Text className="text-[11px] text-content-muted">
              <Text className="font-semibold">{boostLevelLabel(level)}</Text>
              {" · "}
              {boostCountLabel(boostCount)}
            </Text>
            <Text className="text-[11px] text-content-subtle">{count}</Text>
          </View>
          <BoostProgressBar
            boostCount={boostCount}
            target={target}
            label={progress}
          />
        </View>
      </View>
      {onBoost ? (
        <View className="items-end">
          <BoostServerButton onPress={onBoost} />
        </View>
      ) : null}
    </View>
  );
}
