import {
  networkFailure,
  toApiResult,
  type ApiResult,
} from "@discordia/client-shared";

import { getToken, updateToken } from "./storage";
import { env } from "./env";

interface RefreshResponseBody {
  user: unknown;
  token: string;
}

type AuthEventHandlers = {
  onTokenRefreshed?: (token: string, user: unknown) => void;
  onSessionExpired?: () => void;
};

let authEventHandlers: AuthEventHandlers = {};

export function setAuthEventHandlers(handlers: AuthEventHandlers): void {
  authEventHandlers = handlers;
}
let refreshPromise: Promise<string | null> | null = null;

const AUTH_PATHS_WITHOUT_RETRY = new Set([
  "/v1/login",
  "/v1/login/2fa",
  "/v1/logout",
]);

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${env.apiUrl}/v1/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      authEventHandlers.onSessionExpired?.();
      return null;
    }

    const data = (await res.json()) as RefreshResponseBody;
    await updateToken(data.token);
    authEventHandlers.onTokenRefreshed?.(data.token, data.user);
    return data.token;
  } catch {
    return null;
  }
}

/**
 * Cliente HTTP unico hacia el backend (via el API Gateway).
 *
 * Nunca tira: devuelve `ApiResult<T>`, igual que `web-client`. Un 409 "ese
 * nombre ya existe" es un resultado esperado del negocio, no una excepcion, y
 * la union discriminada obliga a chequear `ok` antes de leer `data`.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  return (await apiFetchWithBody<T>(path, options)).result;
}

export async function apiFetchWithBody<T = unknown>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<{ result: ApiResult<T>; body: unknown }> {
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    return { result: networkFailure(), body: null };
  }

  // El access token dura 15 min: cualquier request se tope
  // con uno vencido. En vez de mostrarle un error al usuario, se intenta
  // renovar una sola vez (con el refresh token de la cookie) y se reintenta
  // la request original antes de rendirse.
  //
  // Login, el paso de 2FA y logout quedan afuera: en login/2fa un 401 significa
  // "credencial incorrecta", no "sesion vencida" (reintentarlos gastaria un
  // intento del desafio por cada codigo mal tipeado); en logout no tiene
  // sentido renovar la sesion que justo se esta cerrando.
  if (res.status === 401 && !isRetry && !AUTH_PATHS_WITHOUT_RETRY.has(path)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetchWithBody<T>(path, options, true);
    }
  }

  // Un 204 o un body que no es JSON dejan `body` en null: no es un error.
  // Axios ya hace este paso solo, por eso en web no existe.
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {}

  return { result: toApiResult<T>(res.status, body), body };
}
