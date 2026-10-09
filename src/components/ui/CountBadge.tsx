import { Text, View } from "react-native";

import { cn } from "../../lib/cn";

interface CountBadgeProps {
  count: number;
  label: string;
  className?: string;
}

export function CountBadge({ count, label, className }: CountBadgeProps) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(
        "h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1",
        className,
      )}
    >
      <Text className="text-[10px] font-bold text-white">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}
