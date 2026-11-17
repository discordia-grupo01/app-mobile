import {
  BANNER_PRESETS_LABEL,
  type BoostLevel,
  boostPerkAvailableFrom,
  canSetServerBanner,
  PRESET_BANNERS,
  type PresetBanner,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { cn } from "../../../../../lib/cn";
import { BoostBenefitField } from "../../../../boosts/components/BoostBenefitField";
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
  level: BoostLevel;
  boostCount: number;
  onSelect: (preset: PresetBanner) => void;
}

export function BannerPresetPicker({
  selectedId,
  level,
  boostCount,
  onSelect,
}: BannerPresetPickerProps) {
  const isLocked = !canSetServerBanner(level);

  return (
    <BoostBenefitField
      perk="custom_banner"
      level={level}
      boostCount={boostCount}
      title={BANNER_PRESETS_LABEL}
    >
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
    </BoostBenefitField>
  );
}
