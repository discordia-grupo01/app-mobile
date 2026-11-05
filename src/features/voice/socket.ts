import {
  createSocketManager,
  PRIVATE_CALL_EVENTS,
  privateCallTopic,
  type VoicePresenceEvent,
} from "@discordia/client-shared";
import { type Channel, Socket } from "phoenix";
import { AppState } from "react-native";

import { env } from "../../lib/env";
import { fetchVoiceSocketTicket } from "./api";

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

export type PrivateCallHandlers = Readonly<
  Record<keyof typeof PRIVATE_CALL_EVENTS, (payload: unknown) => void>
>;

export function connectPrivateCalls(
  userId: string,
  handlers: PrivateCallHandlers,
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
    channel = acquired.socket.channel(privateCallTopic(userId), {});
    channel.on(PRIVATE_CALL_EVENTS.incoming, handlers.incoming);
    channel.on(PRIVATE_CALL_EVENTS.accepted, handlers.accepted);
    channel.on(PRIVATE_CALL_EVENTS.answered, handlers.answered);
    channel.on(PRIVATE_CALL_EVENTS.rejected, handlers.rejected);
    channel.on(PRIVATE_CALL_EVENTS.missed, handlers.missed);
    channel.on(PRIVATE_CALL_EVENTS.ended, handlers.ended);
    channel.join();
  });

  return () => {
    disposed = true;
    channel?.leave();
    release?.();
  };
}
