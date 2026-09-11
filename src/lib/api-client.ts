import { getToken } from "./storage";
import { env } from "./env";

/**
 Error tipado con el status HTTP, para que cada feature
 */
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

/**
 * Error de conectividad: la request nunca llego a obtener una respuesta HTTP
 * (sin conexion a internet, el host de `env.apiUrl` es inalcanzable desde la
 * red actual del dispositivo, timeout, etc). Se distingue de `ApiError` para
 * no mostrarle al usuario un mensaje que sugiera un error del backend cuando
 * en realidad el celular no pudo ni conectarse al gateway.
 */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("No se pudo conectar con el servidor.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

/** Cliente HTTP unico hacia el backend (via el API Gateway) */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    // `fetch` rechaza (TypeError: Network request failed) cuando no hay
    // conexion o el host no es alcanzable, sin llegar a devolver un
    // Response. No es un error de la API: es que nunca hubo respuesta.
    throw new NetworkError(err);
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
