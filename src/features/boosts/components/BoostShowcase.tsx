import {
  BOOST_PERK_LEVEL,
  BOOST_PERKS,
  BOOST_SHOWCASE_COPY,
  BOOST_SHOWCASE_TITLE,
  BOOST_UNLOCKED_LABEL,
  type BoostLevel,
  boostLevelLabel,
  hasBoostPerk,
  type ServerSummary,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { BoostShowcaseArt } from "./BoostShowcaseArt";

interface BoostShowcaseProps {
  server: ServerSummary;
  level: BoostLevel;
}

export function BoostShowcase({ server, level }: BoostShowcaseProps) {
  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="font-display text-base font-bold text-content"
      >
        {BOOST_SHOWCASE_TITLE}
      </Text>
      {BOOST_PERKS.map((perk) => {
        const unlocked = hasBoostPerk(level, perk);
        const copy = BOOST_SHOWCASE_COPY[perk];
        return (
          <View
            key={perk}
            className={cn(
              "rounded-2xl border bg-surface-raised p-3.5",
              unlocked ? "border-accent" : "border-line opacity-75",
            )}
          >
            <BoostShowcaseArt perk={perk} server={server} />
            <View className="mt-3 flex-row items-start justify-between gap-2.5">
              <View className="flex-1">
                <Text className="font-display text-sm font-bold text-content">
                  {copy.title}
                </Text>
                <Text className="mt-1 text-xs leading-[18px] text-content-muted">
                  {copy.detail}
                </Text>
              </View>
              <View
                className={cn(
                  "rounded-full px-2 py-0.75",
                  unlocked ? "bg-accent" : "bg-surface-input",
                )}
              >
                <Text
                  className={cn(
                    "text-[10px] font-bold",
                    unlocked ? "text-boost-paper" : "text-content-muted",
                  )}
                >
                  {unlocked
                    ? BOOST_UNLOCKED_LABEL
                    : boostLevelLabel(BOOST_PERK_LEVEL[perk])}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
