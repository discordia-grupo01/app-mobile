import {
  BANNER_PRESETS_LABEL,
  PRESET_BANNERS,
  type PresetBanner,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../../lib/cn";
import { PresetGradientFill } from "./PresetGradientFill";

const SWATCH_HEIGHT = 64;
const SWATCH_RADIUS = 16;
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
  onPress,
}: {
  preset: PresetBanner;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1"
      accessibilityRole="button"
      accessibilityLabel={`Fondo ${preset.label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={{
          height: SWATCH_HEIGHT,
          borderRadius: SWATCH_RADIUS,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          className={cn(
            "flex-1 overflow-hidden border-2",
            isSelected ? "border-white" : "border-transparent",
          )}
          style={{ borderRadius: SWATCH_RADIUS }}
        >
          <PresetGradientFill preset={preset} idPrefix="swatch" />
          {isSelected ? (
            <View className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full items-center justify-center bg-[rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.5)]">
              <Feather name="check" size={11} color="#ffffff" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface BannerPresetPickerProps {
  selectedId: string | null;
  onSelect: (preset: PresetBanner) => void;
}

export function BannerPresetPicker({
  selectedId,
  onSelect,
}: BannerPresetPickerProps) {
  return (
    <View className="px-7 mt-5">
      <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2 uppercase">
        {BANNER_PRESETS_LABEL}
      </Text>
      <View className="gap-2.5">
        {chunk(PRESET_BANNERS, COLUMNS).map((row, index) => (
          <View key={index} className="flex-row gap-2.5">
            {row.map((preset) => (
              <PresetSwatch
                key={preset.id}
                preset={preset}
                isSelected={selectedId === preset.id}
                onPress={() => onSelect(preset)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
