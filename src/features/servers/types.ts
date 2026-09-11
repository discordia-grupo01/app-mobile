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
 * `ServerSummary` tal como lo maneja el front en memoria: agrega si el
 * usuario subio un icono propio en esta sesion. El backend no distingue
 * esto en su respuesta (siempre manda un `icon_url`, incluso el generado
 * por default), asi que esta info solo existe del lado del front -- un
 * server cargado por `GET /v1/servers` (de una sesion anterior) arranca
 * en `false`, no hay forma de saber si su icono es uno que el usuario
 * eligio o el default generado por el back.
 */
export interface ServerListItem extends ServerSummary {
  hasCustomIcon: boolean;
}

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
