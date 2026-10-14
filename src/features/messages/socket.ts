import { createSocketManager } from "@discordia/client-shared";
import { Socket } from "phoenix";
import { AppState } from "react-native";

import { env } from "../../lib/env";
import { fetchSocketTicket } from "./api";

/**
 * Socket de mensajes de la app. La conexion, los tickets y la reconexion viven
 * en `createSocketManager` (`@discordia/client-shared`); aca solo va lo propio
 * de React Native.
 */
export const {
  acquireSocket,
  closeSocket,
  onSocketSessionExpired,
  onSocketGaveUp,
} =
  createSocketManager({
    createSocket: (params) => new Socket(env.wsUrl, { params }),
    fetchTicket: fetchSocketTicket,
    // En segundo plano el sistema puede matar la conexion sin avisar: al volver
    // a primer plano, si el socket no esta abierto, se reconecta ya en vez de
    // esperar a que Phoenix se entere del corte.
    watchLifecycle: ({ reconnectIfDisconnected }) => {
      const subscription = AppState.addEventListener("change", (next) => {
        if (next === "active") reconnectIfDisconnected();
      });
      return () => subscription.remove();
    },
  });
