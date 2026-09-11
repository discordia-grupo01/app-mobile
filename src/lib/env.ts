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

export const env = {
  apiUrl: resolveApiUrl(),
};
