import * as FileSystem from "expo-file-system/legacy";

import { ApiError, NetworkError, apiFetch } from "../../lib/api-client";
import { env } from "../../lib/env";
import { getToken } from "../../lib/storage";
import type {
  CreateServerActionResult,
  CreateServerParams,
  GetServerActionResult,
  JoinServerActionResult,
  LeaveServerActionResult,
  ListServersActionResult,
  ServersApiErrorBody,
  ServerSummary,
} from "./types";

const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisá tu conexión a internet e intentá de nuevo.";
const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Volvé a iniciar sesión.";

function reasonOf(err: ApiError): string | undefined {
  const body = err.body as ServersApiErrorBody | undefined;
  const reason = body?.error?.details?.reason;
  return typeof reason === "string" ? reason : undefined;
}

export function serverIconUrl(serverId: string): string {
  return `${env.apiUrl}/v1/servers/${serverId}/icon`;
}

export async function listMyServers(): Promise<ListServersActionResult> {
  try {
    const servers = await apiFetch<ServerSummary[]>("/v1/servers", {
      method: "GET",
    });
    return { ok: true, servers };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    return {
      ok: false,
      message: "No pudimos cargar tus servidores. Intenta de nuevo.",
    };
  }
}

export async function getServer(
  serverId: string,
): Promise<GetServerActionResult> {
  try {
    const server = await apiFetch<ServerSummary>(`/v1/servers/${serverId}`, {
      method: "GET",
    });
    return { ok: true, server };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    return { ok: false, message: "No pudimos cargar el servidor." };
  }
}

const CREATE_REASON_MESSAGES: Record<string, string> = {
  name_required: "Ingresá un nombre para el servidor.",
  name_too_short: "El nombre debe tener entre 2 y 100 caracteres.",
  name_too_long: "El nombre debe tener entre 2 y 100 caracteres.",
  name_invalid_chars: "El nombre contiene caracteres no permitidos.",
  name_taken: "Ya tenés un servidor con ese nombre.",
  icon_too_large: "El archivo no puede pesar más de 20 MB.",
  icon_unsupported_type: "El archivo debe ser PNG, JPG o WEBP.",
  icon_unreadable: "No pudimos leer esa imagen. Probá con otra.",
};

export async function createServer(
  params: CreateServerParams,
): Promise<CreateServerActionResult> {
  const token = await getToken();
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  let status: number;
  let rawBody: string;
  try {
    if (params.icon) {
      const uploadResult = await FileSystem.uploadAsync(
        `${env.apiUrl}/v1/servers`,
        params.icon.uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "icon",
          mimeType: params.icon.type,
          parameters: { name: params.name },
          headers: authHeaders,
        },
      );
      status = uploadResult.status;
      rawBody = uploadResult.body;
    } else {
      const formData = new FormData();
      formData.append("name", params.name);
      const res = await fetch(`${env.apiUrl}/v1/servers`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      status = res.status;
      rawBody = await res.text();
    }
  } catch (err) {
    if (__DEV__) {
      console.error("createServer: request failed", err);
    }
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {}

  if (status < 200 || status >= 300) {
    const errBody = body as ServersApiErrorBody | undefined;
    const reason =
      typeof errBody?.error?.details?.reason === "string"
        ? errBody.error.details.reason
        : undefined;
    const field =
      typeof errBody?.error?.details?.field === "string"
        ? errBody.error.details.field
        : undefined;
    const friendly = reason ? CREATE_REASON_MESSAGES[reason] : undefined;

    if ((field === "name" || field === "icon") && friendly) {
      return {
        ok: false,
        message: friendly,
        fieldErrors: { [field]: friendly },
      };
    }
    if (status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: friendly ?? "Algo salió mal. Intenta de nuevo.",
    };
  }

  return { ok: true, server: body as ServerSummary };
}

export function normalizeInviteCode(raw: string): string {
  const match = raw.trim().match(/([A-Za-z0-9_-]{4,20})$/);
  return match ? match[1] : raw.trim();
}

const JOIN_REASON_MESSAGES: Record<string, string> = {
  invitation_invalid: "Este enlace de invitación no es válido o expiró.",
  user_banned: "No podés unirte a este servidor.",
};

export async function joinServerByCode(
  code: string,
): Promise<JoinServerActionResult> {
  try {
    const result = await apiFetch<{
      server_id: string;
      already_member: boolean;
    }>(`/v1/invites/${encodeURIComponent(code)}/join`, { method: "POST" });

    const serverResult = await getServer(result.server_id);
    if (!serverResult.ok) {
      return {
        ok: false,
        message:
          "Te uniste, pero no pudimos cargar el servidor. Reintentá en un momento.",
      };
    }

    return {
      ok: true,
      server: serverResult.server,
      alreadyMember: result.already_member,
    };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      const friendly = reason ? JOIN_REASON_MESSAGES[reason] : undefined;
      if (friendly) {
        return {
          ok: false,
          message: friendly,
          fieldErrors: { code: friendly },
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        const notFound = "Ese código de invitación no existe.";
        return {
          ok: false,
          message: notFound,
          fieldErrors: { code: notFound },
        };
      }
    }

    return {
      ok: false,
      message: "No pudimos procesar la solicitud. Intenta de nuevo.",
    };
  }
}

const LEAVE_REASON_MESSAGES: Record<string, string> = {
  owner_must_transfer_or_delete:
    "Sos el dueño de este servidor: transferí la propiedad o eliminalo antes de abandonarlo.",
};

export async function leaveServer(
  serverId: string,
  userId: number | string,
): Promise<LeaveServerActionResult> {
  try {
    await apiFetch<void>(`/v1/servers/${serverId}/members/${userId}`, {
      method: "DELETE",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      if (reason === "owner_must_transfer_or_delete") {
        return {
          ok: false,
          message: LEAVE_REASON_MESSAGES[reason],
          reason,
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        return {
          ok: false,
          message: "Este servidor ya no existe o ya no sos miembro.",
        };
      }
    }

    return {
      ok: false,
      message: "No pudimos abandonar el servidor. Intenta de nuevo.",
    };
  }
}
