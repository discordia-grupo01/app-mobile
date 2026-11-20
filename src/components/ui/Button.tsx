import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

import { cn } from "../../lib/cn";
import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";
import { ButtonFill, buttonFillFor } from "./ButtonFill";

export type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "md" | "sm";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconRight?: keyof typeof Feather.glyphMap;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
}

const CONTAINER_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface-input border border-line",
  danger: "bg-danger-strong",
};

const CONTAINER_SIZE: Record<ButtonSize, string> = {
  md: "min-h-12 rounded-xl p-3.5",
  sm: "min-h-9 rounded-lg px-3 py-2",
};

/** Mismo radio que `CONTAINER_SIZE`: el degradé se recorta con él. */
const RADIUS: Record<ButtonSize, string> = {
  md: "rounded-xl",
  sm: "rounded-lg",
};

const TEXT_VARIANT: Record<ButtonVariant, string> = {
  primary: "text-on-accent",
  secondary: "text-content-muted",
  danger: "text-on-accent",
};

export function Button({
  title,
  isLoading = false,
  disabled,
  variant = "primary",
  size = "md",
  iconRight,
  iconLeft,
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const isButtonDisabled = disabled || isLoading;
  const fill = buttonFillFor(variant, colors);

  return (
    <TouchableOpacity
      className={cn(
        "items-center justify-center",
        CONTAINER_SIZE[size],
        fullWidth && "w-full",
        CONTAINER_VARIANT[variant],
        isButtonDisabled && "opacity-60",
        className,
      )}
      disabled={isButtonDisabled}
      accessibilityRole="button"
      {...props}
      style={[
        fill && !isButtonDisabled
          ? // `boxShadow` y no `elevation`: en Android la elevacion sale gris y
            // corrida, sin el halo de color que tiene web.
            { boxShadow: `0 6px 20px ${withAlpha(fill.shadow, 0.4)}` }
          : null,
        props.style,
      ]}
    >
      {fill ? <ButtonFill fill={fill} rounded={RADIUS[size]} /> : null}
      {isLoading ? (
        <ActivityIndicator color={colors.onAccent} size="small" />
      ) : (
        <View
          className={cn(
            "flex-row items-center justify-center",
            fullWidth && "w-full",
          )}
        >
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
