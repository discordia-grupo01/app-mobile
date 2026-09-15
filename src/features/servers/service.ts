import * as FileSystem from "expo-file-system/legacy";

import { ApiError, NetworkError, apiFetch } from "../../lib/api-client";
import { env } from "../../lib/env";
import { getToken } from "../../lib/storage";
import type {
  CreateServerActionResult,
  CreateServerParams,
  GenerateInviteActionResult,
  GetServerActionResult,
  InitiateTransferActionResult,
  Invitation,
  JoinServerActionResult,
  LeaveServerActionResult,
  ListMembersActionResult,
  ListServersActionResult,
  MemberListResponse,
  OwnershipTransfer,
  RevokeInviteActionResult,
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
  userId: string,
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

export function inviteLinkText(code: string): string {
  return `/invite/${code}`;
}

const GENERATE_INVITE_REASON_MESSAGES: Record<string, string> = {
  max_uses_invalid: "Ingresá un número entero mayor a 0.",
  invite_permission_denied: "No sos miembro de este servidor.",
};

export async function generateInvite(
  serverId: string,
  maxUses: number | null,
): Promise<GenerateInviteActionResult> {
  try {
    const invitation = await apiFetch<Invitation>(
      `/v1/servers/${serverId}/invites`,
      {
        method: "POST",
        body: JSON.stringify(maxUses != null ? { max_uses: maxUses } : {}),
      },
    );
    return { ok: true, invitation };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      if (reason === "max_uses_invalid") {
        const message = GENERATE_INVITE_REASON_MESSAGES[reason];
        return { ok: false, message, fieldErrors: { maxUses: message } };
      }
      if (reason === "invite_permission_denied") {
        return { ok: false, message: GENERATE_INVITE_REASON_MESSAGES[reason] };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
    }

    return {
      ok: false,
      message: "No pudimos generar el enlace. Intenta de nuevo.",
    };
  }
}

export async function revokeInvite(
  code: string,
): Promise<RevokeInviteActionResult> {
  try {
    await apiFetch<void>(`/v1/invites/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este enlace ya no existe." };
      }
    }

    return {
      ok: false,
      message: "No pudimos revocar el enlace. Intenta de nuevo.",
    };
  }
}

const LIST_MEMBERS_REASON_MESSAGES: Record<string, string> = {
  forbidden_not_member: "Ya no sos miembro de este servidor.",
};

export async function listMembers(
  serverId: string,
  params?: { limit?: number; offset?: number },
): Promise<ListMembersActionResult> {
  const query = new URLSearchParams();
  if (params?.limit != null) query.set("limit", String(params.limit));
  if (params?.offset != null) query.set("offset", String(params.offset));
  const qs = query.toString();

  try {
    const data = await apiFetch<MemberListResponse>(
      `/v1/servers/${serverId}/members${qs ? `?${qs}` : ""}`,
      { method: "GET" },
    );
    return { ok: true, members: data.members, total: data.total };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      if (reason && LIST_MEMBERS_REASON_MESSAGES[reason]) {
        return { ok: false, message: LIST_MEMBERS_REASON_MESSAGES[reason] };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
    }
    return {
      ok: false,
      message: "No pudimos cargar los miembros del servidor.",
    };
  }
}

const INITIATE_TRANSFER_REASON_MESSAGES: Record<string, string> = {
  required:
    "Ingresá el ID del miembro al que le vas a transferir la propiedad.",
  not_a_member: "Ese usuario no es miembro de este servidor.",
  already_owner: "Esa persona ya es la propietaria del servidor.",
};

export async function initiateOwnershipTransfer(
  serverId: string,
  toUserId: string,
): Promise<InitiateTransferActionResult> {
  try {
    const transfer = await apiFetch<OwnershipTransfer>(
      `/v1/servers/${serverId}/ownership-transfers`,
      {
        method: "POST",
        body: JSON.stringify({ to_user_id: toUserId }),
      },
    );
    return { ok: true, transfer };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);

      if (reason === "transfer_already_pending") {
        return {
          ok: false,
          message: "Ya hay una transferencia pendiente para este servidor.",
          reason: "transfer_already_pending",
        };
      }

      const fieldMessage = reason
        ? INITIATE_TRANSFER_REASON_MESSAGES[reason]
        : undefined;
      if (fieldMessage) {
        return {
          ok: false,
          message: fieldMessage,
          fieldErrors: { toUserId: fieldMessage },
        };
      }

      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede transferir este servidor.",
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
    }

    return {
      ok: false,
      message: "No pudimos enviar la transferencia. Intenta de nuevo.",
    };
  }
}
