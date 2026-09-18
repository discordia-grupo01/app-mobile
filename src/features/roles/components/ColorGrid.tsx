import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

import { colors } from "../../../theme/colors";
import { COLOR_PALETTE, isValidHex } from "../constants";
import { styles } from "../styles";

interface ColorGridProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorGrid({ value, onChange }: ColorGridProps) {
  const [custom, setCustom] = useState(
    COLOR_PALETTE.includes(value) ? "" : value,
  );
  const [showCustom, setShowCustom] = useState(false);

  return (
    <View>
      <View style={styles.colorGrid}>
        {COLOR_PALETTE.map((swatch) => {
          const selected = value === swatch;
          return (
            <TouchableOpacity
              key={swatch}
              activeOpacity={0.8}
              onPress={() => {
                onChange(swatch);
                setShowCustom(false);
              }}
              style={[
                styles.colorSwatch,
                { backgroundColor: swatch },
                selected ? styles.colorSwatchSelected : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Color ${swatch}`}
            >
              {selected ? (
                <Feather name="check" size={13} color="#fff" />
              ) : null}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowCustom((prev) => !prev)}
          style={[
            styles.colorSwatch,
            styles.colorSwatchCustom,
            isValidHex(custom) ? { backgroundColor: custom } : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Color personalizado"
        >
          {isValidHex(custom) ? (
            <Feather name="edit-2" size={12} color="#fff" />
          ) : (
            <Feather name="plus" size={14} color={colors.textSubtle} />
          )}
        </TouchableOpacity>
      </View>

      {showCustom ? (
        <View style={styles.customColorRow}>
          <View
            style={[
              styles.customColorSwatch,
              {
                backgroundColor: isValidHex(custom) ? custom : colors.bgInput,
              },
            ]}
          />
          <View style={styles.customColorInputWrap}>
            <TextInput
              value={custom}
              onChangeText={(text) => {
                setCustom(text);
                if (isValidHex(text)) onChange(text);
              }}
              placeholder="#3d9bb5"
              placeholderTextColor={colors.textSubtle}
              maxLength={7}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.customColorInput}
            />
          </View>
          {isValidHex(custom) ? (
            <Feather name="check" size={14} color={colors.success} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
