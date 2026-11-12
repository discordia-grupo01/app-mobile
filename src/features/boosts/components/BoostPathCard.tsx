import {
  BOOST_LEVEL_THRESHOLDS,
  type BoostLevel,
  boostCountLabel,
  boostLevelLabel,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import {
  BOOST_MILESTONE_LABELS,
  BOOST_MILESTONES,
  BOOST_PATH_START_LABEL,
  boostNextLevelPitch,
  boostPathProgress,
  boostServerTitle,
} from "../boostPath";
import { BoostLevelIcon, boostLevelIconBox } from "./BoostLevelIcon";
import { BoostServerButton } from "./BoostServerButton";

const ICON_SIZE = 18;
const NODE_PADDING = 2;
const TRACK_HEIGHT = 6;
const TRACK_TOP =
  (boostLevelIconBox(ICON_SIZE) + NODE_PADDING * 2 - TRACK_HEIGHT) / 2;
const TRACK_INSET = `${100 / (BOOST_MILESTONES.length + 1) / 2}%` as const;

interface BoostPathCardProps {
  serverName: string;
  level: BoostLevel;
  boostCount: number;
  onBoost: () => void;
}

export function BoostPathCard({
  serverName,
  level,
  boostCount,
  onBoost,
}: BoostPathCardProps) {
  const pitch = boostNextLevelPitch(level, boostCount);
  if (pitch === undefined) return null;

  return (
    <View
      className="gap-4 rounded-2xl border bg-surface-raised p-4"
      style={{ borderColor: `${PREMIUM_BRAND_COLORS.yellow}66` }}
    >
      <View className="gap-1">
        <Text className="font-display text-[15px] font-bold text-content">
          {boostServerTitle(serverName)}
        </Text>
        <Text className="text-xs leading-[18px] text-content-muted">
          {pitch}
        </Text>
      </View>

      <View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`${boostLevelLabel(level)} · ${boostCountLabel(boostCount)}`}
          accessibilityValue={{
            min: 0,
            max: BOOST_LEVEL_THRESHOLDS[BOOST_LEVEL_THRESHOLDS.length - 1],
            now: boostCount,
          }}
          className="absolute overflow-hidden rounded-full bg-surface-input"
          style={{
            left: TRACK_INSET,
            right: TRACK_INSET,
            top: TRACK_TOP,
            height: TRACK_HEIGHT,
          }}
        >
          <View
            className="h-full rounded-full bg-accent-strong"
            style={{ width: `${boostPathProgress(boostCount) * 100}%` }}
          />
        </View>
        <View className="flex-row">
          <Milestone
            icon={<BoostLevelIcon level={0} size={ICON_SIZE} />}
            title={BOOST_PATH_START_LABEL}
            detail={boostCountLabel(boostCount)}
            reached={false}
          />
          {BOOST_MILESTONES.map((milestone) => (
            <Milestone
              key={milestone}
              icon={
                <BoostLevelIcon
                  level={milestone}
                  size={ICON_SIZE}
                  dimmed={level < milestone}
                />
              }
              title={BOOST_MILESTONE_LABELS[milestone]}
              detail={boostCountLabel(BOOST_LEVEL_THRESHOLDS[milestone - 1])}
              reached={level >= milestone}
            />
          ))}
        </View>
      </View>

      <BoostServerButton onPress={onBoost} fullWidth />
    </View>
  );
}

function Milestone({
  icon,
  title,
  detail,
  reached,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  reached: boolean;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      <View
        className="rounded-lg bg-surface-raised"
        style={{ padding: NODE_PADDING }}
      >
        {icon}
      </View>
      <Text
        className={cn(
          "text-center text-[10px] leading-[13px]",
          reached ? "font-semibold text-content" : "text-content-subtle",
        )}
      >
        {title}
        {"\n"}
        {detail}
      </Text>
    </View>
  );
}
