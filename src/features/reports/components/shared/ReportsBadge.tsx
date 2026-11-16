import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ReportsBadgeProps {
  label: string;
  count?: number;
  className?: string;
}

export function ReportsBadge({ label, count, className }: ReportsBadgeProps) {
  const colors = useThemeColors();

  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(
        "h-[18px] min-w-[18px] flex-row items-center justify-center gap-0.5 rounded-full bg-warning",
        count === undefined ? "w-[18px]" : "px-1.5",
        className,
      )}
    >
      <Feather name="flag" size={10} color={colors.onAccent} />
      {count === undefined ? null : (
        <Text className="text-[10px] font-bold text-on-accent">
          {count > 99 ? "99+" : count}
        </Text>
      )}
    </View>
  );
}
