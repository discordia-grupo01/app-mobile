import {
  NOTIFICATION_LEVEL_DESCRIPTIONS,
  NOTIFICATION_LEVEL_LABELS,
  type NotificationLevel,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface NotificationLevelOptionProps {
  level: NotificationLevel;
  isSelected: boolean;
  badge: string | null;
  disabled: boolean;
  isLast: boolean;
  onPress: () => void;
}

export function NotificationLevelOption({
  level,
  isSelected,
  badge,
  disabled,
  isLast,
  onPress,
}: NotificationLevelOptionProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        !isLast && "border-b border-line",
      )}
    >
      <View className="flex-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-[15px] font-bold text-content">
            {NOTIFICATION_LEVEL_LABELS[level]}
          </Text>
          {badge ? (
            <Text className="rounded-full bg-surface-input px-2 py-0.5 text-[10px] font-semibold text-content-subtle">
              {badge}
            </Text>
          ) : null}
        </View>
        <Text className="mt-0.5 text-[12px] leading-[17px] text-content-muted">
          {NOTIFICATION_LEVEL_DESCRIPTIONS[level]}
        </Text>
      </View>
      {isSelected ? (
        <Feather name="check" size={18} color={colors.accent} />
      ) : null}
    </TouchableOpacity>
  );
}
