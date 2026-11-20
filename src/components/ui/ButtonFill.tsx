import { type ThemeColors } from "@discordia/client-shared";

import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { cn } from "../../lib/cn";
import { type ButtonVariant } from "./Button";

export interface ButtonFillColors {
  from: string;
  to: string;
  shadow: string;
}

/** Degradé y color de sombra de los botones llenos, como en web; el secundario no tiene. */
export function buttonFillFor(
  variant: ButtonVariant,
  colors: ThemeColors,
): ButtonFillColors | null {
  if (variant === "primary") {
    return {
      from: colors.accentGradientStart,
      to: colors.accentGradientEnd,
      shadow: colors.accent,
    };
  }
  if (variant === "danger") {
    return {
      from: colors.dangerBright,
      to: colors.danger,
      shadow: colors.danger,
    };
  }
  return null;
}

/** Fondo en degradé, recortado con el mismo radio que el boton. */
export function ButtonFill({
  fill,
  rounded,
}: {
  fill: ButtonFillColors;
  rounded: string;
}) {
  // `useId` trae ":" y en `url(#...)` no todas las versiones de svg lo aceptan.
  const gradientId = `button-fill-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View
      pointerEvents="none"
      className={cn("absolute inset-0 overflow-hidden", rounded)}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {/* De izquierda a derecha: asi se ve el `to-br` de web en un boton ancho. */}
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={fill.from} />
            <Stop offset="1" stopColor={fill.to} />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
        />
      </Svg>
    </View>
  );
}
