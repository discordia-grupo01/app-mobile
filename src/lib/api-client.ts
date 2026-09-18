import { getToken, updateToken } from "./storage";
import { env } from "./env";

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("No se pudo conectar con el servidor.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

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

/** Cliente HTTP unico hacia el backend (via el API Gateway). */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
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
  } catch (err) {
    throw new NetworkError(err);
  }

  // El access token dura 15 min: cualquier request se tope
  // con uno vencido. En vez de mostrarle un error al usuario, se intenta
  // renovar una sola vez (con el refresh token de la cookie) y se reintenta
  // la request original antes de rendirse.
  if (res.status === 401 && !isRetry && path !== "/v1/login") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, true);
    }
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`, body);
  }

  return body as T;
}
