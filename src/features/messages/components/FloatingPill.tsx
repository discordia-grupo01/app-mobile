import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "../../../lib/cn";

/** Aspecto comun de los globitos del chat (conexion, mensajes anteriores). */
export const PILL_CLASS =
  "max-w-full flex-row items-center gap-2 rounded-full border border-line bg-surface-hover px-3.5 py-1.5 shadow-lg";

interface FloatingPillProps {
  /** Arriba del chat o abajo, sobre el composer. */
  position: "top" | "bottom";
  children: ReactNode;
}

/**
 * Ubica un globito flotando sobre los mensajes, centrado y sin empujarlos: el
 * contenedor no ocupa alto y solo el globito recibe toques.
 */
export function FloatingPill({ position, children }: FloatingPillProps) {
  return (
    <View pointerEvents="box-none" className="z-10 h-0">
      <View
        pointerEvents="box-none"
        className={cn(
          "absolute inset-x-0 items-center px-4",
          position === "top" ? "top-3" : "bottom-3",
        )}
      >
        {children}
      </View>
    </View>
  );
}
