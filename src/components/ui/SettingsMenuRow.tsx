import { Feather } from "@expo/vector-icons";
import { useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { cn } from "../../lib/cn";
import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

export interface SettingsMenuRowPressedColors {
  background: string;
  tile: string;
  text: string;
}

interface SettingsMenuRowProps {
  icon: FeatherIconName | ReactNode;
  title: string;
  subtitle?: string;
  danger?: boolean;
  badge?: ReactNode;
  showChevron?: boolean;
  pressedColors?: SettingsMenuRowPressedColors;
  className?: string;
  onPress: () => void;
}

export function SettingsMenuRow({
  icon,
  title,
  subtitle,
  danger = false,
  badge,
  showChevron = true,
  pressedColors,
  className,
  onPress,
}: SettingsMenuRowProps) {
  const colors = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);
  const activeColors = isPressed ? pressedColors : undefined;
  const tileColor = danger
    ? withAlpha(colors.danger, 0.14)
    : withAlpha(colors.info, 0.15);

  return (
    <Pressable
      className={cn(
        "mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4",
        className,
      )}
      style={
        activeColors
          ? {
              backgroundColor: activeColors.background,
              borderColor: activeColors.background,
            }
          : isPressed
            ? { opacity: 0.75 }
            : undefined
      }
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: activeColors?.tile ?? tileColor }}
      >
        {typeof icon === "string" ? (
          <Feather
            name={icon as FeatherIconName}
            size={20}
            color={danger ? colors.danger : colors.sky}
          />
        ) : (
          icon
        )}
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-[16px] font-bold",
            subtitle && "mb-0.5",
            danger ? "text-danger" : "text-content",
          )}
          style={activeColors ? { color: activeColors.text } : undefined}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-[13px] text-content-subtle"
            style={activeColors ? { color: activeColors.text } : undefined}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge}
      {showChevron ? (
        <Feather
          name="chevron-right"
          size={18}
          color={activeColors ? activeColors.text : colors.textSubtle}
        />
      ) : null}
    </Pressable>
  );
}
