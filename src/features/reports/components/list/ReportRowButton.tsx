import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

const BUTTON_TONE = {
  danger: "border",
  neutral: "border border-line",
  primary: "bg-accent",
} as const;

const BUTTON_TEXT_TONE = {
  danger: "text-danger",
  neutral: "text-content-muted",
  primary: "text-on-accent",
} as const;

export function RowButton({
  icon,
  trailingIcon,
  label,
  tone,
  isDisabled = false,
  isLoading = false,
  isStretched = false,
  onPress,
}: {
  icon?: FeatherIconName;
  trailingIcon?: FeatherIconName;
  label: string;
  tone: keyof typeof BUTTON_TONE;
  isDisabled?: boolean;
  isLoading?: boolean;
  isStretched?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const iconColor =
    tone === "danger"
      ? colors.danger
      : tone === "primary"
        ? colors.onAccent
        : colors.textMuted;

  const tintStyle =
    tone === "danger"
      ? {
          borderColor: withAlpha(colors.danger, 0.4),
          backgroundColor: withAlpha(colors.danger, 0.08),
        }
      : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={tintStyle}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={cn(
        "min-h-11 flex-row items-center justify-center gap-1.5 rounded-lg px-3",
        BUTTON_TONE[tone],
        isStretched && "flex-1",
        isDisabled && "opacity-50",
      )}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon ? (
        <Feather name={icon} size={14} color={iconColor} />
      ) : null}
      <Text
        numberOfLines={1}
        className={cn("text-[13px] font-semibold", BUTTON_TEXT_TONE[tone])}
      >
        {label}
      </Text>
      {trailingIcon ? (
        <Feather name={trailingIcon} size={14} color={iconColor} />
      ) : null}
    </TouchableOpacity>
  );
}

export function LinkAction({
  icon,
  label,
  onPress,
}: {
  icon: FeatherIconName;
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="link"
      className="min-h-8 flex-row items-center gap-1.5"
    >
      <Feather name={icon} size={15} color={colors.accentBright} />
      <Text className="text-[13px] font-semibold text-accent-strong">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
