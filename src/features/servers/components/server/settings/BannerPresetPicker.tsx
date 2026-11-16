import {
  BANNER_PRESETS_LABEL,
  BOOST_PERK_LEVEL,
  boostLevelLabel,
  boostPerkAvailableFrom,
  boostPerkLevelLabel,
  PRESET_BANNERS,
  type PresetBanner,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../../lib/cn";
import { BoostLevelIcon } from "../../../../boosts/components/BoostLevelIcon";
import { PresetGradientFill } from "./PresetGradientFill";

const SWATCH_HEIGHT = 52;
const RING_WIDTH = 2;
const RING_GAP = 2;
const SWATCH_RADIUS = 12;
const RING_RADIUS = SWATCH_RADIUS + RING_WIDTH + RING_GAP;
const LOCKED_OPACITY = 0.45;
const COLUMNS = 3;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function PresetSwatch({
  preset,
  isSelected,
  isLocked,
  onPress,
}: {
  preset: PresetBanner;
  isSelected: boolean;
  isLocked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLocked}
      className={cn(
        "flex-1",
        isSelected ? "border-accent" : "border-transparent",
      )}
      style={{
        borderWidth: RING_WIDTH,
        borderRadius: RING_RADIUS,
        padding: RING_GAP,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Fondo ${preset.label}`}
      accessibilityHint={
        isLocked ? boostPerkAvailableFrom("custom_banner") : undefined
      }
      accessibilityState={{ selected: isSelected, disabled: isLocked }}
    >
      <View
        className="overflow-hidden"
        style={{ height: SWATCH_HEIGHT, borderRadius: SWATCH_RADIUS }}
      >
        <View
          className="flex-1"
          style={{ opacity: isLocked ? LOCKED_OPACITY : 1 }}
        >
          <PresetGradientFill
            preset={preset}
            idPrefix="swatch"
            radius={SWATCH_RADIUS}
          />
        </View>
        {isLocked ? (
          <View className="absolute inset-0 items-center justify-center">
            <Feather name="lock" size={14} color="#ffffff" />
          </View>
        ) : null}
        {isSelected ? (
          <View className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full items-center justify-center bg-accent">
            <Feather name="check" size={11} color="#ffffff" />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

interface BannerPresetPickerProps {
  selectedId: string | null;
  isLocked: boolean;
  onSelect: (preset: PresetBanner) => void;
}

export function BannerPresetPicker({
  selectedId,
  isLocked,
  onSelect,
}: BannerPresetPickerProps) {
  return (
    <View className="px-7 mt-5">
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
          {BANNER_PRESETS_LABEL}
        </Text>
        {isLocked ? (
          <View className="flex-row items-center gap-1 rounded-full border border-line bg-surface-input px-2 py-1">
            <BoostLevelIcon level={BOOST_PERK_LEVEL.custom_banner} size={14} />
            <Text className="text-[10px] font-bold text-content-muted">
              {boostLevelLabel(BOOST_PERK_LEVEL.custom_banner)}
            </Text>
          </View>
        ) : (
          <View
            accessible
            accessibilityLabel={boostPerkLevelLabel("custom_banner")}
          >
            <BoostLevelIcon level={BOOST_PERK_LEVEL.custom_banner} size={18} />
          </View>
        )}
      </View>
      <View className="gap-1">
        {chunk(PRESET_BANNERS, COLUMNS).map((row, index) => (
          <View key={index} className="flex-row gap-1">
            {row.map((preset) => (
              <PresetSwatch
                key={preset.id}
                preset={preset}
                isSelected={selectedId === preset.id}
                isLocked={isLocked}
                onPress={() => onSelect(preset)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
