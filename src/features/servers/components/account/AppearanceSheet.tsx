import type { ThemeName } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LIGHT_THEME_ENABLED } from "../../../../lib/constants";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface AppearanceSheetProps {
  visible: boolean;
  selected: ThemeName;
  onSelect: (preference: ThemeName) => void;
  onClose: () => void;
}

interface AppearanceOption {
  value: ThemeName;
  icon: keyof typeof Feather.glyphMap;
  title: string;
}

const ALL_OPTIONS: AppearanceOption[] = [
  {
    value: "dark",
    icon: "moon",
    title: "Modo Oscuro",
  },
  {
    value: "light",
    icon: "sun",
    title: "Modo Claro",
  },
];

const OPTIONS = ALL_OPTIONS.filter(
  (option) => option.value !== "light" || LIGHT_THEME_ENABLED,
);

export function AppearanceSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: AppearanceSheetProps) {
  const colors = useThemeColors();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4.5 pt-2.5 pb-7">
          <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-4" />
          <Text className="text-[17px] font-bold text-content mb-3.5">
            Apariencia
          </Text>

          {OPTIONS.map((option) => {
            const isSelected = option.value === selected;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.75}
                className={cn(
                  "flex-row items-center gap-3.5 rounded-[14px] py-3 px-2",
                  isSelected && "bg-[rgba(45,122,140,0.15)]",
                )}
                onPress={() => onSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  className={cn(
                    "w-9.5 h-9.5 rounded-xl items-center justify-center",
                    isSelected
                      ? "bg-[rgba(36,92,107,0.3)]"
                      : "bg-[rgba(107,149,189,0.15)]",
                  )}
                >
                  <Feather
                    name={option.icon}
                    size={18}
                    color={isSelected ? colors.sky : colors.textSubtle}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-content">
                    {option.title}
                  </Text>
                </View>
                {isSelected ? (
                  <Feather name="check" size={18} color={colors.sky} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
