import { COLOR_PALETTE, isValidHex } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { cn } from "../../../lib/cn";

interface ColorGridProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorGrid({ value, onChange }: ColorGridProps) {
  const colors = useThemeColors();
  const [custom, setCustom] = useState(
    COLOR_PALETTE.includes(value) ? "" : value,
  );
  const [showCustom, setShowCustom] = useState(false);

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
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
              className={cn(
                "w-9 h-9 rounded-[10px] items-center justify-center",
                selected ? "border-2 border-white" : null,
              )}
              style={{ backgroundColor: swatch }}
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
          className={cn(
            "w-9 h-9 rounded-[10px] items-center justify-center",
            "border-2 border-dashed border-line-strong",
          )}
          style={isValidHex(custom) ? { backgroundColor: custom } : null}
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
        <View className="flex-row items-center gap-2 mt-3">
          <View
            className="w-8 h-8 rounded-[10px] border border-line"
            style={{
              backgroundColor: isValidHex(custom) ? custom : colors.bgInput,
            }}
          />
          <View className="flex-1 rounded-xl border border-line bg-surface-input px-3">
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
              className="text-content text-[13px] py-2.5"
              style={{ fontFamily: "monospace" }}
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
