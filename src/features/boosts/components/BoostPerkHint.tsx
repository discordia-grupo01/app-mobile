import {
  BOOST_PERK_LABELS,
  BOOST_PERK_LEVEL,
  type BoostLevel,
  type BoostPerk,
  boostPerkLevelLabel,
  boostPerkUnlockProgress,
  hasBoostPerk,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { BoostLevelIcon } from "./BoostLevelIcon";

const ICON_SIZE = 24;

interface BoostPerkHintProps {
  perk: BoostPerk;
  level: BoostLevel;
  boostCount: number;
  unlockedHint: string;
}

export function BoostPerkHint({
  perk,
  level,
  boostCount,
  unlockedHint,
}: BoostPerkHintProps) {
  const unlocked = hasBoostPerk(level, perk);
  return (
    <View className="flex-row items-center gap-2.5">
      <View accessible accessibilityLabel={boostPerkLevelLabel(perk)}>
        <BoostLevelIcon
          level={BOOST_PERK_LEVEL[perk]}
          size={ICON_SIZE}
          dimmed={!unlocked}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-semibold text-content-muted">
          {BOOST_PERK_LABELS[perk]}
        </Text>
        <Text className="text-[11px] text-content-subtle">
          {unlocked ? unlockedHint : boostPerkUnlockProgress(perk, boostCount)}
        </Text>
      </View>
    </View>
  );
}
