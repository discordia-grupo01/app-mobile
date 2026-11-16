import type { VoiceSessionTarget } from "@discordia/client-shared";

import { useEffect } from "react";

import {
  startCallService,
  stopCallService,
} from "../../../modules/call-service";

type CallNotification = { title: string; text: string };

/**
 * Mientras haya llamada conectada, mantiene el servicio en primer plano de
 * Android. Sin el, al minimizar la app el microfono queda en silencio.
 * Arranca al conectar, que es cuando la app esta abierta (Android no deja
 * arrancarlo desde segundo plano), y se corta al salir o cambiar de llamada.
 */
export function useCallForegroundService(target: VoiceSessionTarget | null) {
  const notification = target ? callNotificationOf(target) : null;
  const title = notification?.title ?? null;
  const text = notification?.text ?? null;

  useEffect(() => {
    if (title === null || text === null) return;
    startCallService(title, text);
    return stopCallService;
  }, [title, text]);
}

export function callNotificationOf(
  target: VoiceSessionTarget,
): CallNotification {
  if (target.kind === "channel") {
    return {
      title: `En llamada en #${target.channelName}`,
      text: `${target.serverName} · Tocá para volver a la llamada`,
    };
  }
  return {
    title: `En llamada con ${target.partnerName}`,
    text: "Tocá para volver a la llamada",
  };
}
