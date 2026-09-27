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

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  iconName?: keyof typeof Feather.glyphMap;
}

export function TextField({
  label,
  error,
  isPassword = false,
  iconName,
  className,
  ...props
}: TextFieldProps) {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-[18px] w-full">
      <Text className="mb-2 text-[11px] font-bold tracking-[1.2px] uppercase text-content-subtle">
        {label}
      </Text>
      <View
        className={cn(
          "min-h-12 flex-row items-center rounded-xl border bg-surface-input px-3.5",
          error
            ? "border-danger"
            : isFocused
              ? "border-accent"
              : "border-line",
        )}
      >
        {iconName ? (
          <Feather
            name={iconName}
            size={16}
            color={colors.textSubtle}
            style={{ marginRight: 10 }}
          />
        ) : null}

        {/* text-[14px] y no text-sm: text-sm agrega line-height, que en un
            TextInput desalinea el texto en iOS. */}
        <TextInput
          className={cn("flex-1 py-3 text-[14px] text-content", className)}
          placeholderTextColor={colors.textSubtle}
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
              color={colors.textSubtle}
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
