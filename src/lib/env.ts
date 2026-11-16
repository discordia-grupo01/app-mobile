import Constants from "expo-constants";

const BACKEND_PORT = 8000;

/**
 * Resuelve la URL base del backend (API Gateway / Kong).
 *
 * Prioridad:
 * 1. EXPO_PUBLIC_API_URL, si está seteada en .env (override explícito,
 *    util para apuntar a un backend deployado en vez del local).
 * 2. Auto-detección vía Expo: en Expo Go / dev client, Metro expone la
 *    IP con la que el celular se conectó al bundler (la misma que
 *    escaneaste en el QR). Reusamos esa IP para el backend, asumiendo
 *    que corre en la misma PC en el puerto 8000. Así no hay que
 *    actualizar la IP a mano cada vez que cambia la red.
 * 3. Fallback a localhost (util para web / simulador iOS).
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${BACKEND_PORT}`;
  }

  return "http://localhost:8000";
}

/**
 * URL publica de `web-client`, para armar los links de invitacion que se
 * comparten fuera de la app y para cargar `/voice-embed`, donde corre la
 * llamada de voz. Sin ella no se puede entrar a un canal de voz.
 *
 * No se puede auto-detectar como `apiUrl`: el front web no corre en la misma
 * maquina que el bundler de Metro. Mientras no este seteada, los links quedan
 * relativos (`/invite/abc123`) y no sirven para compartir.
 *
 * TODO: setear `EXPO_PUBLIC_WEB_URL` al dominio de Vercel una vez que el
 * deploy de `web-client` tenga una URL estable.
 */
function resolveWebUrl(): string | null {
  return process.env.EXPO_PUBLIC_WEB_URL ?? null;
}

/**
 * Base del socket de Phoenix (el cliente le agrega `/websocket`). Sale por el
 * mismo gateway que la API: `http(s)://host` -> `ws(s)://host/socket`.
 * `EXPO_PUBLIC_WS_URL` pisa el valor si el socket vive en otra direccion.
 */
function resolveWsUrl(apiUrl: string): string {
  return (
    process.env.EXPO_PUBLIC_WS_URL ?? `${apiUrl.replace(/^http/, "ws")}/socket`
  );
}

function resolveVoiceWsUrl(apiUrl: string): string {
  return (
    process.env.EXPO_PUBLIC_VOICE_WS_URL ??
    `${apiUrl.replace(/^http/, "ws")}/voice/socket`
  );
}

function resolveNotificationsWsUrl(apiUrl: string): string {
  return (
    process.env.EXPO_PUBLIC_NOTIFICATIONS_WS_URL ??
    `${apiUrl.replace(/^http/, "ws")}/notifications/socket`
  );
}

const apiUrl = resolveApiUrl();

export const env = {
  apiUrl,
  wsUrl: resolveWsUrl(apiUrl),
  voiceWsUrl: resolveVoiceWsUrl(apiUrl),
  notificationsWsUrl: resolveNotificationsWsUrl(apiUrl),
  webUrl: resolveWebUrl(),
};
