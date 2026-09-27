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
  /**
   * "surface" (default) es para inputs sobre fondos de contenido normales
   * (modales, tarjetas). "onAccent" es para inputs renderizados directo
   * sobre `bg-surface-servers` (pantallas de auth / PIN): ese fondo es un
   * color de marca (en tema claro es literalmente `accent`), así que los
   * tokens de contenido genéricos (`bg-surface-input`, `border-line`,
   * `text-content-subtle`) quedan invisibles ahí y hace falta la paleta
   * "on accent" en su lugar.
   */
  tone?: "surface" | "onAccent";
}

export function TextField({
  label,
  error,
  isPassword = false,
  iconName,
  className,
  tone = "surface",
  ...props
}: TextFieldProps) {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const onAccent = tone === "onAccent";

  const subtleColor = onAccent ? colors.onAccentSubtle : colors.textSubtle;

  return (
    <View className="mb-[18px] w-full">
      <Text
        className={cn(
          "mb-2 text-[11px] font-bold tracking-[1.2px] uppercase",
          onAccent ? "text-on-accent-subtle" : "text-content-subtle",
        )}
      >
        {label}
      </Text>
      <View
        className={cn(
          "min-h-12 flex-row items-center rounded-xl border px-3.5",
          onAccent ? "bg-surface-input-on-accent" : "bg-surface-input",
          error
            ? "border-danger"
            : isFocused
              ? onAccent
                ? "border-line-on-accent-strong"
                : "border-accent"
              : onAccent
                ? "border-line-on-accent"
                : "border-line",
        )}
      >
        {iconName ? (
          <Feather
            name={iconName}
            size={16}
            color={subtleColor}
            style={{ marginRight: 10 }}
          />
        ) : null}

        {/* text-[14px] y no text-sm: text-sm agrega line-height, que en un
            TextInput desalinea el texto en iOS. */}
        <TextInput
          className={cn(
            "flex-1 py-3 text-[14px]",
            onAccent ? "text-on-accent" : "text-content",
            className,
          )}
          placeholderTextColor={subtleColor}
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
              color={subtleColor}
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
