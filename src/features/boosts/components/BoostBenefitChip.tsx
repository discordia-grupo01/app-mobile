import {
  type BoostLevel,
  type BoostPerk,
  boostBenefitChip,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { BoostLevelIcon } from "./BoostLevelIcon";

interface BoostBenefitChipProps {
  perk: BoostPerk;
  level: BoostLevel;
  boostCount: number;
}

export function BoostBenefitChip({
  perk,
  level,
  boostCount,
}: BoostBenefitChipProps) {
  const colors = useThemeColors();
  const chip = boostBenefitChip(perk, level, boostCount);

  return (
    <View
      accessible
      accessibilityLabel={chip.accessibilityLabel}
      className={cn(
        "h-[26px] shrink-0 flex-row items-center gap-1.5 rounded-full border pl-[5px] pr-2.5",
        chip.locked
          ? "border-line-strong bg-surface-input"
          : "border-accent bg-accent",
      )}
    >
      <BoostLevelIcon
        level={chip.level}
        size={16}
        bare
        onAccent={!chip.locked}
      />
      <Text
        className={cn(
          "text-[11px] font-bold",
          chip.locked ? "text-content" : "text-on-accent",
        )}
      >
        {chip.label}
      </Text>
      {chip.locked ? (
        <>
          {chip.detail ? (
            <Text className="text-[11px] font-medium text-content-muted">
              {chip.detail}
            </Text>
          ) : null}
          <Feather name="lock" size={12} color={colors.textMuted} />
        </>
      ) : (
        <Feather name="check" size={12} color={colors.onAccent} />
      )}
    </View>
  );
}
