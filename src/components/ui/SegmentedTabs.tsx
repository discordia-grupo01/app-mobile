import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../lib/cn";

export interface SegmentedTab<T extends string> {
  value: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Pestañas en fila que se reparten el ancho, para alternar entre dos vistas. */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: SegmentedTabsProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      className="flex-row gap-2"
    >
      {tabs.map((tab) => {
        const isSelected = tab.value === value;
        return (
          <TouchableOpacity
            key={tab.value}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(tab.value)}
            className={cn(
              "min-w-0 flex-1 rounded-lg px-3 py-2.5",
              isSelected ? "bg-surface-hover" : "bg-surface-input",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                "text-center text-[13px] font-semibold",
                isSelected ? "text-content" : "text-content-muted",
              )}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
