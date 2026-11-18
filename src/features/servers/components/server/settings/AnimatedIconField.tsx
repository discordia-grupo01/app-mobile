import {
  ANIMATED_SERVER_ICON_COPY,
  type BoostLevel,
  canUseAnimatedServerIcon,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import { BoostBenefitField } from "../../../../boosts/components/BoostBenefitField";

interface AnimatedIconFieldProps {
  level: BoostLevel;
  boostCount: number;
  onPickIcon: () => void;
}

export function AnimatedIconField({
  level,
  boostCount,
  onPickIcon,
}: AnimatedIconFieldProps) {
  const colors = useThemeColors();
  const unlocked = canUseAnimatedServerIcon(level);

  return (
    <BoostBenefitField
      perk="animated_icon"
      level={level}
      boostCount={boostCount}
      title={ANIMATED_SERVER_ICON_COPY.title}
    >
      <View
        className={cn(
          "flex-row items-center gap-3 rounded-xl border border-line p-3.5",
          unlocked && "bg-accent/10",
        )}
      >
        <View
          className={cn(
            "h-12 w-12 items-center justify-center rounded-xl",
            unlocked
              ? "bg-boost-yellow"
              : "border border-line bg-surface-raised",
          )}
        >
          <Text
            className={cn(
              "text-[13px] font-extrabold tracking-[0.5px]",
              unlocked ? "text-boost-ink" : "text-content-muted",
            )}
          >
            {ANIMATED_SERVER_ICON_COPY.badge}
          </Text>
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="text-xs leading-[18px] text-content-muted">
            {unlocked
              ? ANIMATED_SERVER_ICON_COPY.unlocked
              : ANIMATED_SERVER_ICON_COPY.locked}
          </Text>
          {unlocked ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPickIcon}
              accessibilityRole="button"
              className="h-9 flex-row items-center gap-1.5 self-start rounded-[10px] border border-line-strong px-3"
            >
              <Feather name="upload" size={14} color={colors.text} />
              <Text className="text-[13px] font-semibold text-content">
                {ANIMATED_SERVER_ICON_COPY.upload}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </BoostBenefitField>
  );
}
