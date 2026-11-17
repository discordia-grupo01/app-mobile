import {
  type BoostLevel,
  VANITY_INVITE_LOCKED_COPY,
  vanitySlug,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";
import { BoostBenefitChip } from "../../../boosts/components/BoostBenefitChip";
import { BoostServerButton } from "../../../boosts/components/BoostServerButton";
import { vanityLinkPrefix } from "../../api";

interface LockedVanityLinkProps {
  serverName: string;
  level: BoostLevel;
  boostCount: number;
  onBoost: () => void;
  onShowBenefits: () => void;
}

export function LockedVanityLink({
  serverName,
  level,
  boostCount,
  onBoost,
  onShowBenefits,
}: LockedVanityLinkProps) {
  const colors = useThemeColors();

  return (
    <View
      accessibilityLabel={VANITY_INVITE_LOCKED_COPY.title}
      className="gap-2.5 rounded-[14px] border border-dashed border-line-strong bg-surface-input p-3"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-[13px] font-bold text-content">
          {VANITY_INVITE_LOCKED_COPY.title}
        </Text>
        <BoostBenefitChip
          perk="vanity_url"
          level={level}
          boostCount={boostCount}
        />
      </View>
      <View
        importantForAccessibility="no-hide-descendants"
        className="flex-row items-center gap-2"
      >
        <Feather name="link-2" size={14} color={colors.textSubtle} />
        <Text
          className="flex-1 text-[13px] text-content-subtle"
          numberOfLines={1}
        >
          {vanityLinkPrefix()}
          <Text className="font-bold">{vanitySlug(serverName)}</Text>
        </Text>
      </View>
      <Text className="text-xs leading-[17px] text-content-muted">
        {VANITY_INVITE_LOCKED_COPY.detail}
      </Text>
      <BoostServerButton onPress={onBoost} fullWidth />
      <TouchableOpacity
        onPress={onShowBenefits}
        accessibilityRole="link"
        hitSlop={8}
        className="self-center"
      >
        <Text className="text-[13px] font-semibold text-info">
          {VANITY_INVITE_LOCKED_COPY.benefits}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
