import {
  type PresenceStore,
  reportActivity,
  type UserRoomPush,
} from "@discordia/client-shared";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { usePresenceSelector } from "./PresenceContext";

/**
 * `true` si con este estado de la app hay que avisar ausente, `false` si hay
 * que avisar que volvio y `null` si no cambia nada: `inactive` (iOS) es un
 * instante, por ejemplo al bajar el centro de control.
 */
export function isIdleAppState(state: AppStateStatus): boolean | null {
  if (state === "background") return true;
  if (state === "active") return false;
  return null;
}

/**
 * En el celular no hay mouse que medir y el sistema pausa la app en segundo
 * plano, asi que irse a segundo plano es "dejar de usarla": se avisa `idle` y
 * al volver, `active`. El back decide si eso se ve como "ausente" (con "no
 * molestar" no cambia nada).
 */
export function useIdleReporter(store: PresenceStore, push: UserRoomPush) {
  const joins = usePresenceSelector(store, (state) => state.userRoomJoins);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      const idle = isIdleAppState(next);
      if (idle !== null) void reportActivity(push, idle);
    });
    return () => subscription.remove();
  }, [push]);

  // Cada union de la sala personal es una conexion nueva, que el back arranca
  // activa: si la app sigue en segundo plano, se repite.
  useEffect(() => {
    if (joins > 0 && AppState.currentState === "background") {
      void reportActivity(push, true);
    }
  }, [joins, push]);
}
