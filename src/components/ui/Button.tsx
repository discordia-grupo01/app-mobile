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
  /**
   * Por defecto el botón ocupa el 100% del ancho del padre (útil para CTAs
   * de una sola columna). Pasar `false` cuando va en una fila junto a otro
   * botón (ej. Cancelar/Guardar) -- antes esto se intentaba anular pasando
   * `style={{ width: undefined }}`, pero en la práctica no siempre cancelaba
   * el `width: "100%"` de la base (el botón terminaba empujado fuera de la
   * fila). Con este prop directamente no se agrega `width: "100%"` a los
   * estilos, sin depender de que un `style` posterior lo pise.
   */
  fullWidth?: boolean;
}

export function Button({
  title,
  isLoading = false,
  disabled,
  variant = "primary",
  iconRight,
  iconLeft,
  fullWidth = true,
  style,
  ...props
}: ButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth ? styles.buttonFullWidth : null,
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
    minHeight: 48,
  },
  buttonFullWidth: {
    width: "100%",
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
