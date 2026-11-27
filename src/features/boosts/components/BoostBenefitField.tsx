import { type BoostLevel, type BoostPerk } from "@discordia/client-shared";
import type { ReactNode } from "react";
import { View } from "react-native";

import { FieldLabel } from "../../../components/ui/FieldLabel";

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
        <FieldLabel className="flex-1">{title}</FieldLabel>
        <BoostBenefitChip perk={perk} level={level} boostCount={boostCount} />
      </View>
      {children}
    </View>
  );
}
