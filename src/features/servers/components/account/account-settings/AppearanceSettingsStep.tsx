import type { ThemeName } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";

interface AppearanceSettingsStepProps {
  selected: ThemeName;
  onSelect: (preference: ThemeName) => void;
}

interface AppearanceOption {
  value: ThemeName;
  icon: keyof typeof Feather.glyphMap;
  iconColorKey: "sky" | "highlight";
  title: string;
  description: string;
}

const OPTIONS: AppearanceOption[] = [
  {
    value: "dark",
    icon: "moon",
    iconColorKey: "sky",
    title: "Modo oscuro",
    description: "Azul profundo, menos brillo",
  },
  {
    value: "light",
    icon: "sun",
    iconColorKey: "highlight",
    title: "Modo claro",
    description: "Paper, cálido y luminoso",
  },
];

/** Mockup en miniatura de la app, igual al preview de las tarjetas del Figma. */
function ThemePreview({ theme }: { theme: ThemeName }) {
  if (theme === "light") {
    return (
      <View className="h-28 justify-center bg-[#F5F2EB] p-4">
        <View className="h-full flex-row gap-2 rounded-lg bg-[#EAE5D9] p-2">
          <View className="w-1/4 rounded bg-[#245C6B]" />
          <View className="flex-1 justify-center gap-2 py-1">
            <View className="h-2 w-2/3 rounded-full bg-[#245C6B]/40" />
            <View className="h-2 w-full rounded-full bg-[#245C6B]/15" />
            <View className="h-2 w-4/5 rounded-full bg-[#245C6B]/15" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="h-28 justify-center p-4">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="darkThemePreview" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0f1922" />
            <Stop offset="1" stopColor="#1e2d42" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill="url(#darkThemePreview)"
        />
      </Svg>
      <View className="h-full flex-row gap-2 rounded-lg bg-[#1C293B] p-2">
        <View className="w-1/4 rounded bg-[#245C6B]" />
        <View className="flex-1 justify-center gap-2 py-1">
          <View className="h-2 w-2/3 rounded-full bg-white/30" />
          <View className="h-2 w-full rounded-full bg-white/10" />
          <View className="h-2 w-4/5 rounded-full bg-white/10" />
        </View>
      </View>
    </View>
  );
}

export function AppearanceSettingsStep({
  selected,
  onSelect,
}: AppearanceSettingsStepProps) {
  const colors = useThemeColors();

  return (
    <View className="px-4.5 pt-5">
      <Text className="mb-1 text-[17px] font-bold text-content">
        Elegí cómo se ve Discordia
      </Text>
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        El tema se aplica inmediatamente en toda la aplicación.
      </Text>

      {OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.85}
            className={cn(
              "mb-4 overflow-hidden rounded-2xl border-2",
              isSelected ? "border-accent" : "border-line",
            )}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <ThemePreview theme={option.value} />
            <View className="flex-row items-center gap-3 bg-surface-raised p-4">
              <Feather
                name={option.icon}
                size={19}
                color={colors[option.iconColorKey]}
              />
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-content">
                  {option.title}
                </Text>
                <Text className="text-[12px] text-content-subtle">
                  {option.description}
                </Text>
              </View>
              {isSelected ? (
                <Feather name="check-circle" size={19} color={colors.success} />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
