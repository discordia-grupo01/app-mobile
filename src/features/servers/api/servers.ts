import {
  detailsOf,
  INVITE_REASONS,
  fieldOf,
  messageFor,
  NETWORK_ERROR_MESSAGE,
  reasonOf,
  REQUEST_FAILED_MESSAGE,
  SERVER_REASONS,
  SESSION_EXPIRED_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from "@discordia/client-shared";
import * as FileSystem from "expo-file-system/legacy";

import { apiFetch, refreshAccessToken } from "../../../lib/api-client";
import { env } from "../../../lib/env";
import { getToken } from "../../../lib/storage";
import type {
  CreateServerActionResult,
  CreateServerParams,
  GetServerActionResult,
  JoinServerActionResult,
  LeaveServerActionResult,
  ListServersActionResult,
  ServerSummary,
} from "../types";

export function serverIconUrl(serverId: string): string {
  return `${env.apiUrl}/v1/servers/${serverId}/icon`;
}

export async function listMyServers(): Promise<ListServersActionResult> {
  const result = await apiFetch<ServerSummary[]>("/v1/servers", {
    method: "GET",
  });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos cargar tus servidores. Intentá de nuevo.",
      ),
    };
  }
  return { ok: true, servers: result.data };
}

export async function getServer(
  serverId: string,
): Promise<GetServerActionResult> {
  const result = await apiFetch<ServerSummary>(`/v1/servers/${serverId}`, {
    method: "GET",
  });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, "No pudimos cargar el servidor."),
    };
  }
  return { ok: true, server: result.data };
}

async function uploadServer(
  params: CreateServerParams,
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

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
    return { status: uploadResult.status, rawBody: uploadResult.body };
  }

  const formData = new FormData();
  formData.append("name", params.name);
  const res = await fetch(`${env.apiUrl}/v1/servers`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

export async function createServer(
  params: CreateServerParams,
): Promise<CreateServerActionResult> {
  let status: number;
  let rawBody: string;
  try {
    const token = await getToken();
    const first = await uploadServer(params, token);
    status = first.status;
    rawBody = first.rawBody;

    if (status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await uploadServer(params, newToken);
        status = retry.status;
        rawBody = retry.rawBody;
      }
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
    const details = detailsOf(body);
    const reason = reasonOf(details);
    const field = fieldOf(details);
    const friendly = reason ? SERVER_REASONS[reason] : undefined;

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
      message: friendly ?? UNEXPECTED_ERROR_MESSAGE,
    };
  }

  return { ok: true, server: body as ServerSummary };
}

export async function leaveServer(
  serverId: string,
  userId: string,
): Promise<LeaveServerActionResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/members/${userId}`,
    { method: "DELETE" },
  );

  if (!result.ok) {
    const reason = reasonOf(result.details);
    if (reason === "owner_must_transfer_or_delete") {
      return {
        ok: false,
        message:
          "Sos el dueño de este servidor: transferí la propiedad o eliminalo antes de abandonarlo.",
        reason,
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 404) {
      return {
        ok: false,
        message: "Este servidor ya no existe o ya no sos miembro.",
      };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos abandonar el servidor. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true };
}

export async function joinServerByCode(
  code: string,
): Promise<JoinServerActionResult> {
  const result = await apiFetch<{
    server_id: string;
    already_member: boolean;
  }>(`/v1/invites/${encodeURIComponent(code)}/join`, { method: "POST" });

  if (!result.ok) {
    const reason = reasonOf(result.details);
    // Estos ademas marcan el campo del formulario.
    const friendly = reason ? INVITE_REASONS[reason] : undefined;
    if (friendly) {
      return { ok: false, message: friendly, fieldErrors: { code: friendly } };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 404) {
      const notFound = "Ese código de invitación no existe.";
      return { ok: false, message: notFound, fieldErrors: { code: notFound } };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  const serverResult = await getServer(result.data.server_id);
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
    alreadyMember: result.data.already_member,
  };
}
