import {
  BOOST_PROGRESS_STRIP_COPY,
  BOOST_SECTION_TAB_LABELS,
  type BoostLevel,
  boostCountLabel,
  boostLevelLabel,
  boostProgressAriaLabel,
  boostProgressCountLabel,
  boostsForLevelParts,
  boostsRequiredFor,
  nextBoostLevel,
} from "@discordia/client-shared";
import { Text, TouchableOpacity, View } from "react-native";

import { BoostActionIcon } from "./BoostActionIcon";
import { BoostLevelIcon } from "./BoostLevelIcon";
import { BoostProgressBar } from "./BoostProgressBar";

interface BoostProgressStripProps {
  level: BoostLevel;
  boostCount: number;
  onBoost?: () => void;
  onShowBenefits?: () => void;
}

export function BoostProgressStrip({
  level,
  boostCount,
  onBoost,
  onShowBenefits,
}: BoostProgressStripProps) {
  const next = nextBoostLevel(level);
  if (next === undefined) return null;

  const target = boostsRequiredFor(next);
  const parts = boostsForLevelParts(next, boostCount);

  return (
    <View
      accessibilityLabel={BOOST_PROGRESS_STRIP_COPY.ariaLabel}
      className="gap-2.5 rounded-[14px] border border-accent bg-boost-band p-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-[10px] border border-boost-band-line bg-boost-band-tile">
          <BoostLevelIcon level={level} size={22} bare />
        </View>
        <View className="flex-1 gap-1.5">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text className="text-[13px] text-boost-on-band">
              <Text className="font-display text-[15px] font-bold">
                {boostLevelLabel(level)}
              </Text>
              <Text className="text-boost-on-band-muted">
                {" · "}
                {boostCountLabel(boostCount)}
              </Text>
            </Text>
            <Text className="text-xs font-bold text-boost-on-band">
              {boostProgressCountLabel(boostCount, target)}
            </Text>
          </View>
          <BoostProgressBar
            boostCount={boostCount}
            target={target}
            label={boostProgressAriaLabel(next, boostCount)}
            size="sm"
          />
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-2.5">
        <View className="flex-1">
          <Text className="text-xs leading-[17px] text-boost-on-band-muted">
            {parts.lead}{" "}
            <Text className="font-bold text-boost-band-highlight">
              {parts.amount}
            </Text>{" "}
            {parts.tail}
          </Text>
          {onShowBenefits ? (
            <TouchableOpacity
              onPress={onShowBenefits}
              accessibilityRole="link"
              hitSlop={8}
            >
              <Text className="text-xs font-semibold text-boost-on-band">
                {BOOST_PROGRESS_STRIP_COPY.benefitsLink} ›
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {onBoost ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onBoost}
            accessibilityRole="button"
            className="h-10 flex-row items-center gap-2 rounded-[10px] bg-boost-cta pl-2 pr-3.5"
          >
            <View className="h-[22px] w-[22px] items-center justify-center rounded-md bg-surface-modal">
              <BoostActionIcon size={16} />
            </View>
            <Text className="font-display text-sm font-bold text-boost-on-cta">
              {BOOST_SECTION_TAB_LABELS.boost}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
