import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface BillingSectionHeaderProps {
  title: string;
  subtitle: string;
  aside?: ReactNode;
}

export function BillingSectionHeader({
  title,
  subtitle,
  aside,
}: BillingSectionHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        <Text className="text-[20px] font-bold text-content">{title}</Text>
        <Text className="mt-1.5 text-[14px] leading-[20px] text-content-muted">
          {subtitle}
        </Text>
      </View>
      {aside}
    </View>
  );
}
