import {
  NOTIFICATIONS_TAB_LABELS,
  type NotificationTab,
} from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";

const TABS: NotificationTab[] = [
  "unread",
  "all",
  "mentions",
  "direct_messages",
];

interface NotificationTabsProps {
  value: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  label: string;
}

export function NotificationTabs({
  value,
  onChange,
  label,
}: NotificationTabsProps) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      className="flex-row border-b border-b-line px-2"
    >
      {TABS.map((tab) => {
        const isSelected = tab === value;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(tab)}
            className={cn(
              "-mb-px min-w-0 flex-1 border-b-2 px-1 py-3",
              isSelected ? "border-b-accent" : "border-b-transparent",
            )}
          >
            <Text
              numberOfLines={1}
              className={cn(
                "text-center text-[13px] font-semibold",
                isSelected ? "text-content" : "text-content-muted",
              )}
            >
              {NOTIFICATIONS_TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
