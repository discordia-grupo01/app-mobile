import {
  BILLING_COPY,
  formatArsFromCents,
  formatPoints,
  type PointsPackage,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";
import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";

interface PointsShopProps {
  packages: PointsPackage[];
  onBuy: (pack: PointsPackage) => void;
}

export function PointsShop({ packages, onBuy }: PointsShopProps) {
  const [selectedId, setSelectedId] = useState(
    packages[Math.floor(packages.length / 2)]?.id ?? null,
  );
  const selected = packages.find((pack) => pack.id === selectedId);

  return (
    <View>
      <Text className="text-[16px] font-bold text-content">
        {BILLING_COPY.buyPointsTitle}
      </Text>
      <Text className="mt-1 text-[13px] text-content-subtle">
        {BILLING_COPY.buyPointsHint}
      </Text>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={BILLING_COPY.buyPointsTitle}
        className="mt-3 gap-2.5"
      >
        {packages.map((pack) => {
          const active = pack.id === selectedId;
          return (
            <TouchableOpacity
              key={pack.id}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setSelectedId(pack.id)}
              className={cn(
                "flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3",
                active
                  ? "border-accent bg-surface-hover"
                  : "border-line bg-surface-raised",
              )}
            >
              <DiscordiaPointIcon size={26} />
              <View className="flex-1">
                <Text
                  className="text-[20px] font-bold text-content tabular-nums"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {pack.points.toLocaleString("es-AR")}
                </Text>
                <Text className="text-[11px] uppercase tracking-wider text-content-subtle">
                  {BILLING_COPY.pointsUnit}
                </Text>
              </View>
              <Text
                className="text-[15px] font-semibold text-content tabular-nums"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatArsFromCents(pack.price_cents)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected ? (
        <Button
          className="mt-4"
          title={BILLING_COPY.buyPackage(formatPoints(selected.points))}
          iconRight="chevron-right"
          onPress={() => onBuy(selected)}
        />
      ) : null}
    </View>
  );
}
