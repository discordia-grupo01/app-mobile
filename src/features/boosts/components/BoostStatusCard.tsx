import {
  BOOST_MAX_LEVEL_DETAIL,
  BOOST_MAX_LEVEL_TITLE,
  type BoostLevel,
  boostActivePerksLabel,
  boostCountLabel,
  boostLevelLabel,
  boostLevelUnlocks,
  boostProgress,
  boostProgressAriaLabel,
  boostProgressCountLabel,
  boostsToNextLevelParts,
  type ServerBoostSummary,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { BoostLevelIcon } from "./BoostLevelIcon";

interface BoostStatusCardProps {
  summary: ServerBoostSummary;
}

export function BoostStatusCard({ summary }: BoostStatusCardProps) {
  const progress = boostProgress(summary);
  const { nextLevel } = progress;

  return (
    <View className="overflow-hidden rounded-2xl border border-accent bg-surface-raised">
      <View className="gap-4 bg-boost-band p-4">
        <View className="flex-row items-center gap-3.5">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-boost-band-line bg-boost-band-tile">
            <BoostLevelIcon level={summary.level} size={34} bare />
          </View>
          <View className="flex-1 gap-1.5">
            <View className="flex-row flex-wrap items-center gap-2.5">
              <Text
                accessibilityRole="header"
                className="font-display text-[24px] font-bold text-boost-on-band"
              >
                {boostLevelLabel(summary.level)}
              </Text>
              <View className="rounded-full bg-boost-band-tile px-2.5 py-0.5">
                <Text className="text-[11px] font-semibold text-boost-on-band">
                  {boostCountLabel(summary.boost_count)}
                </Text>
              </View>
            </View>
            <Text className="text-[13px] leading-[18px] text-boost-on-band-muted">
              {boostActivePerksLabel(summary.level)}
            </Text>
          </View>
        </View>

        {nextLevel ? (
          <NextLevelProgress
            level={nextLevel}
            boostCount={summary.boost_count}
            ratio={progress.ratio}
            target={progress.target ?? 0}
          />
        ) : (
          <Text className="text-[13px] leading-[18px] text-boost-on-band-muted">
            <Text className="font-display font-bold text-boost-on-band">
              {BOOST_MAX_LEVEL_TITLE}
            </Text>{" "}
            {BOOST_MAX_LEVEL_DETAIL}
          </Text>
        )}
      </View>

      {nextLevel ? (
        <Text className="px-4 py-3.5 text-xs leading-[18px] text-content-muted">
          {boostLevelUnlocks(nextLevel).lead}{" "}
          <Text className="text-content">
            {boostLevelUnlocks(nextLevel).perks}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

interface NextLevelProgressProps {
  level: Exclude<BoostLevel, 0>;
  boostCount: number;
  ratio: number;
  target: number;
}

const MARKER_SIZE = 16;

function NextLevelProgress({
  level,
  boostCount,
  ratio,
  target,
}: NextLevelProgressProps) {
  const parts = boostsToNextLevelParts(level, boostCount);
  const percent = `${Math.round(ratio * 1000) / 10}%` as const;

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="flex-1 text-[13px] text-boost-on-band-muted">
          {parts.lead}{" "}
          <Text className="font-bold text-boost-band-highlight">
            {parts.amount}
          </Text>{" "}
          {parts.tail}
        </Text>
        <Text className="text-[13px] font-bold text-boost-on-band">
          {boostProgressCountLabel(boostCount, target)}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={boostProgressAriaLabel(level, boostCount)}
        accessibilityValue={{ min: 0, max: target, now: boostCount }}
        className="justify-center"
        style={{ height: MARKER_SIZE }}
      >
        <View className="h-2.5 overflow-hidden rounded-full bg-boost-track">
          <View
            className="h-full rounded-full bg-info"
            style={{ width: percent }}
          />
        </View>
        <View
          className="absolute top-0 rounded border-2 border-boost-ink bg-boost-yellow"
          style={{
            left: percent,
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            marginLeft: -MARKER_SIZE / 2,
          }}
        />
      </View>
    </View>
  );
}
