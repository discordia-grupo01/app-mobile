import { type BoostLevel, type BoostPerk } from "@discordia/client-shared";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { BoostBenefitChip } from "./BoostBenefitChip";

interface BoostBenefitFieldProps {
  perk: BoostPerk;
  level: BoostLevel;
  boostCount: number;
  title: string;
  children: ReactNode;
}

export function BoostBenefitField({
  perk,
  level,
  boostCount,
  title,
  children,
}: BoostBenefitFieldProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-2.5">
        <Text
          accessibilityRole="header"
          className="flex-1 text-[14px] font-semibold text-content"
        >
          {title}
        </Text>
        <BoostBenefitChip perk={perk} level={level} boostCount={boostCount} />
      </View>
      {children}
    </View>
  );
}
