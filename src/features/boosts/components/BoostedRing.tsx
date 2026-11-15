import type { ReactNode } from "react";
import { View } from "react-native";

/** Lo que se aleja el aro del ícono: 2 px de aire más 2 px de borde (`-inset-1`). */
const RING_OUTSET = 4;

interface BoostedRingProps {
  visible: boolean;
  /** El radio del ícono que envuelve: el aro lo sigue a la misma distancia. */
  borderRadius: number;
  children: ReactNode;
}

/**
 * Aro amarillo de 2 px separado 2 px del ícono, para los servidores en nivel 3.
 * Va por fuera, así el ícono no cambia de tamaño.
 */
export function BoostedRing({
  visible,
  borderRadius,
  children,
}: BoostedRingProps) {
  return (
    <View>
      {children}
      {visible ? (
        <View
          pointerEvents="none"
          className="absolute -inset-1 border-2 border-boost-yellow"
          style={{ borderRadius: borderRadius + RING_OUTSET }}
        />
      ) : null}
    </View>
  );
}
