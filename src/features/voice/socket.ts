import { createSocketManager } from "@discordia/client-shared";
import { type Channel, Socket } from "phoenix";
import { AppState } from "react-native";

import { env } from "../../lib/env";
import { fetchVoiceSocketTicket } from "./api";

export interface VoicePresenceEvent {
  event_type: "voice.participant_joined" | "voice.participant_left";
  server_id: string;
  room_id: string;
  participant_id: string;
  name: string;
}

interface VoicePresenceHandlers {
  joined: (event: VoicePresenceEvent) => void;
  left: (event: VoicePresenceEvent) => void;
  /** El canal se volvio a unir despues de un corte: pudieron perderse eventos. */
  rejoined: () => void;
}

/**
 * Socket de presencia de voz de la app. Igual que el de mensajes, cada conexion
 * necesita un ticket nuevo (vencen a los 30 s), asi que la reconexion la maneja
 * `createSocketManager` y no Phoenix.
 */
const voiceSocket = createSocketManager({
  createSocket: (params) => new Socket(env.voiceWsUrl, { params }),
  fetchTicket: fetchVoiceSocketTicket,
  watchLifecycle: ({ reconnectIfDisconnected }) => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") reconnectIfDisconnected();
    });
    return () => subscription.remove();
  },
});

export function connectVoicePresence(
  serverId: string,
  handlers: VoicePresenceHandlers,
): () => void {
  let disposed = false;
  let channel: Channel | null = null;
  let release: (() => void) | null = null;

  void voiceSocket.acquireSocket().then((acquired) => {
    if (!acquired.ok) return;
    if (disposed) {
      acquired.release();
      return;
    }
    release = acquired.release;
    channel = acquired.socket.channel(`voice_server:${serverId}`, {});
    channel.on("voice.participant_joined", handlers.joined);
    channel.on("voice.participant_left", handlers.left);

    let joinedOnce = false;
    channel.join().receive("ok", () => {
      if (joinedOnce) handlers.rejoined();
      joinedOnce = true;
    });
  });

  return () => {
    disposed = true;
    channel?.leave();
    release?.();
  };
}
