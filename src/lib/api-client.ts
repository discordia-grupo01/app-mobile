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

/** Cliente HTTP unico hacia el backend (via el API Gateway) */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch { }

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`, body);
  }

  return body as T;
}
