import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";

type ButtonVariant = "primary" | "secondary" | "secondaryOnAccent" | "danger";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  iconRight?: keyof typeof Feather.glyphMap;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
}

const CONTAINER_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface-input border border-line",
  // Igual que "secondary" pero para botones renderizados directo sobre
  // bg-surface-servers (pantallas de auth): ahí "bg-surface-input"/"border-line"
  // quedan invisibles en tema claro porque ese fondo es un color de marca.
  secondaryOnAccent: "bg-surface-input-on-accent border border-line-on-accent",
  danger: "bg-danger-strong",
};

const TEXT_VARIANT: Record<ButtonVariant, string> = {
  primary: "text-on-accent",
  secondary: "text-content-muted",
  secondaryOnAccent: "text-on-accent-muted",
  danger: "text-on-accent",
};

export function Button({
  title,
  isLoading = false,
  disabled,
  variant = "primary",
  iconRight,
  iconLeft,
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={cn(
        "min-h-12 items-center justify-center rounded-xl p-3.5",
        fullWidth && "w-full",
        CONTAINER_VARIANT[variant],
        isButtonDisabled && "opacity-50",
        className,
      )}
      disabled={isButtonDisabled}
      accessibilityRole="button"
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.onAccent} size="small" />
      ) : (
        <View className="w-full flex-row items-center justify-center">
          {iconLeft ? <View className="mr-2">{iconLeft}</View> : null}
          <Text
            className={cn(
              "shrink text-center text-sm font-bold",
              TEXT_VARIANT[variant],
            )}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          {iconRight ? (
            <Feather
              name={iconRight}
              size={16}
              color={colors.onAccent}
              style={{ marginLeft: 8 }}
            />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}
