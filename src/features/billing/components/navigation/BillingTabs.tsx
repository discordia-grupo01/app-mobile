import {
  type BillingSection,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";

import { Pressable, ScrollView, Text, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { BILLING_MENU_ITEMS } from "./billingMenuItems";

interface BillingTabsProps {
  active: BillingSection;
  onSelect: (section: BillingSection) => void;
}

/** Solapas de Facturación: la activa en amarillo, con el ícono sobre azul profundo, como en web. */
export function BillingTabs({ active, onSelect }: BillingTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}
      accessibilityRole="tablist"
    >
      {BILLING_MENU_ITEMS.map((item) => {
        const isActive = item.id === active;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn(
              "flex-row items-center gap-2 rounded-xl border px-3 py-2",
              isActive ? "border-transparent" : "border-line bg-surface-input",
            )}
            style={
              isActive
                ? { backgroundColor: PREMIUM_BRAND_COLORS.yellow }
                : undefined
            }
          >
            <View
              className="h-[25px] w-[25px] items-center justify-center rounded-md"
              style={
                isActive
                  ? { backgroundColor: PREMIUM_BRAND_COLORS.deep }
                  : undefined
              }
            >
              <Icon size={17} />
            </View>
            <Text
              className={cn(
                "text-[13px] font-bold",
                !isActive && "text-content-muted",
              )}
              style={
                isActive ? { color: PREMIUM_BRAND_COLORS.deep } : undefined
              }
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
