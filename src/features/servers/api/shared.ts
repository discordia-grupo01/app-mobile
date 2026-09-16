import type { ApiError } from "../../../lib/api-client";
import type { ServersApiErrorBody } from "../types";

export const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisá tu conexión a internet e intentá de nuevo.";

export const SESSION_EXPIRED_MESSAGE =
  "Tu sesión expiró. Volvé a iniciar sesión.";

export function reasonOf(err: ApiError): string | undefined {
  const body = err.body as ServersApiErrorBody | undefined;
  const reason = body?.error?.details?.reason;
  return typeof reason === "string" ? reason : undefined;
}

export function fieldOf(err: ApiError): string | undefined {
  const body = err.body as ServersApiErrorBody | undefined;
  const field = body?.error?.details?.field;
  return typeof field === "string" ? field : undefined;
}
