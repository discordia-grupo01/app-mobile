import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

import { colors } from "../../theme/colors";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  iconRight?: keyof typeof Feather.glyphMap;
  iconLeft?: React.ReactNode;
}

export function Button({
  title,
  isLoading = false,
  disabled,
  variant = "primary",
  iconRight,
  iconLeft,
  style,
  ...props
}: ButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary"
          ? styles.buttonPrimary
          : variant === "secondary"
            ? styles.buttonSecondary
            : styles.buttonDanger,
        isButtonDisabled ? styles.buttonDisabled : null,
        style,
      ]}
      disabled={isButtonDisabled}
      accessibilityRole="button"
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <View style={styles.contentRow}>
          {iconLeft ? (
            <View style={styles.iconLeftWrapper}>{iconLeft}</View>
          ) : null}
          <Text
            style={[
              styles.text,
              variant === "secondary"
                ? styles.textSecondary
                : styles.textPrimary,
            ]}
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
              color="#ffffff"
              style={styles.iconRight}
            />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.bgInput,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonDanger: {
    backgroundColor: colors.dangerBright,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  iconLeftWrapper: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 1,
  },
  textPrimary: {
    color: "#ffffff",
  },
  textSecondary: {
    color: colors.textMuted,
  },
});
