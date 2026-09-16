import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { ThemePreference } from "../../../../lib/storage";
import { colors } from "../../../../theme/colors";

interface AppearanceSheetProps {
  visible: boolean;
  selected: ThemePreference;
  onSelect: (preference: ThemePreference) => void;
  onClose: () => void;
}

const OPTIONS: {
  value: ThemePreference;
  icon: keyof typeof Feather.glyphMap;
  title: string;
}[] = [
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

export function AppearanceSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: AppearanceSheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Apariencia</Text>

          {OPTIONS.map((option) => {
            const isSelected = option.value === selected;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.75}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onSelect(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.optionIcon,
                    isSelected && styles.optionIconAccent,
                  ]}
                >
                  <Feather
                    name={option.icon}
                    size={18}
                    color={isSelected ? colors.sky : colors.textSubtle}
                  />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: colors.bgModal,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionSelected: {
    backgroundColor: "rgba(45,122,140,0.15)",
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,149,189,0.15)",
  },
  optionIconAccent: {
    backgroundColor: "rgba(36,92,107,0.3)",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
});
