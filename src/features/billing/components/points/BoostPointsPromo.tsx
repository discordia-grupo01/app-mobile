import { BOOST_POINTS_PROMO_COPY } from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { BoostActionIcon } from "../../../boosts/components/BoostActionIcon";

interface BoostPointsPromoProps {
  onShowBoosts: () => void;
}

export function BoostPointsPromo({ onShowBoosts }: BoostPointsPromoProps) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-input">
        <BoostActionIcon size={28} />
      </View>
      <View className="flex-1">
        <Text className="font-display text-sm font-bold text-content">
          {BOOST_POINTS_PROMO_COPY.title}
        </Text>
        <Text className="mt-0.5 text-xs leading-[17px] text-content-subtle">
          {BOOST_POINTS_PROMO_COPY.description}
        </Text>
        <TouchableOpacity
          onPress={onShowBoosts}
          accessibilityRole="link"
          className="mt-1.5 self-start"
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-accent-strong">
            {BOOST_POINTS_PROMO_COPY.cta}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
