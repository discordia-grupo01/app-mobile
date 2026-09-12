/** Canal tal como viene embebido en la respuesta de un servidor. */
export interface Channel {
  id: string;
  name: string;
  kind: "text" | "voice";
  position: number;
}

/** Servidor tal como lo devuelve el servicio `servers` (via el gateway). */
export interface ServerSummary {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
  channels: Channel[];
}

/** Forma de error de `servers`: `{ error: { code, message, details? } }`. */
export interface ServersApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * `ServerSummary` tal como lo maneja el front en memoria. Antes acarreaba
 * un `hasCustomIcon` calculado al crear el servidor (el backend no
 * distingue en su respuesta un icono subido por el usuario de uno
 * generado por default, asi que esa info se perdia en cualquier
 * `GET /v1/servers` posterior -- el icono real desaparecia al reabrir la
 * app). Ya no hace falta: `ServerAvatar` intenta cargar el icono siempre
 * (via `serverIconUrl`) y cae a la inicial si la carga falla.
 */
export type ServerListItem = ServerSummary;

export interface CreateServerFieldErrors {
  name?: string;
  icon?: string;
}

/** Icono local elegido con `expo-image-picker`, listo para subir. */
export interface CreateServerIconInput {
  uri: string;
  name: string;
  type: string;
}

export interface CreateServerParams {
  name: string;
  icon?: CreateServerIconInput | null;
}

/** Resultado de crear un servidor para la vista. */
export type CreateServerActionResult =
  | { ok: true; server: ServerSummary }
  | { ok: false; message: string; fieldErrors?: CreateServerFieldErrors };

export interface JoinServerFieldErrors {
  code?: string;
}

/** Resultado de unirse a un servidor para la vista. */
export type JoinServerActionResult =
  | { ok: true; server: ServerSummary; alreadyMember: boolean }
  | { ok: false; message: string; fieldErrors?: JoinServerFieldErrors };

/** Resultado de listar los servidores del usuario para la vista. */
export type ListServersActionResult =
  { ok: true; servers: ServerSummary[] } | { ok: false; message: string };

/** Resultado de pedir un servidor puntual para la vista. */
export type GetServerActionResult =
  { ok: true; server: ServerSummary } | { ok: false; message: string };
