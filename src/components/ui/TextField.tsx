import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";

export type TextFieldTone = "surface" | "onAccent";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  iconName?: keyof typeof Feather.glyphMap;
  tone?: TextFieldTone;
}

const LABEL_TONE_CLASS: Record<TextFieldTone, string> = {
  surface: "text-content-subtle",
  onAccent: "text-on-accent-subtle",
};

const BG_TONE_CLASS: Record<TextFieldTone, string> = {
  surface: "bg-surface-input",
  onAccent: "bg-surface-input-on-accent",
};

const BORDER_TONE_CLASS: Record<TextFieldTone, string> = {
  surface: "border-line",
  onAccent: "border-line-on-accent",
};

const BORDER_FOCUS_TONE_CLASS: Record<TextFieldTone, string> = {
  surface: "border-accent",
  onAccent: "border-line-on-accent-strong",
};

const TEXT_TONE_CLASS: Record<TextFieldTone, string> = {
  surface: "text-content",
  onAccent: "text-on-accent",
};

export function TextField({
  label,
  error,
  isPassword = false,
  iconName,
  tone = "surface",
  className,
  ...props
}: TextFieldProps) {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const iconColor =
    tone === "onAccent" ? colors.onAccentSubtle : colors.textSubtle;

  return (
    <View className="mb-[18px] w-full">
      <Text
        className={cn(
          "mb-2 text-[11px] font-bold tracking-[1.2px] uppercase",
          LABEL_TONE_CLASS[tone],
        )}
      >
        {label}
      </Text>
      <View
        className={cn(
          "min-h-12 flex-row items-center rounded-xl border px-3.5",
          BG_TONE_CLASS[tone],
          error
            ? "border-danger"
            : isFocused
              ? BORDER_FOCUS_TONE_CLASS[tone]
              : BORDER_TONE_CLASS[tone],
        )}
      >
        {iconName ? (
          <Feather
            name={iconName}
            size={16}
            color={iconColor}
            style={{ marginRight: 10 }}
          />
        ) : null}

        {/* text-[14px] y no text-sm: text-sm agrega line-height, que en un
            TextInput desalinea el texto en iOS. */}
        <TextInput
          className={cn(
            "flex-1 py-3 text-[14px]",
            TEXT_TONE_CLASS[tone],
            className,
          )}
          placeholderTextColor={iconColor}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-1.5 p-1.5"
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={16}
              color={iconColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1.5 text-xs text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
