import {
  type CreateServerResult,
  detailsOf,
  fieldOf,
  type GetServerResult,
  INVITE_REASONS,
  type JoinServerResult,
  type LeaveServerResult,
  type ListServersResult,
  messageFor,
  NETWORK_ERROR_MESSAGE,
  reasonOf,
  REQUEST_FAILED_MESSAGE,
  resolveImageUrl,
  SERVER_LEAVE_FAILED,
  SERVER_LOAD_FAILED,
  SERVER_REASONS,
  SERVER_UPDATE_FAILED,
  SERVER_UPDATE_FORBIDDEN,
  SERVERS_LOAD_FAILED,
  type ServerSummary,
  SESSION_EXPIRED_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
  type UpdateServerResult,
} from "@discordia/client-shared";

import { File } from "expo-file-system";

import { apiFetch, refreshAccessToken } from "../../../lib/api-client";
import { env } from "../../../lib/env";
import { getToken } from "../../../lib/storage";
import type {
  CreateServerIconInput,
  CreateServerParams,
  UpdateServerParams,
} from "../types";

function asUploadFile(file: CreateServerIconInput): File {
  return new File(file.uri);
}

export function resolveServerIconUrl(iconUrl: string | null): string | null {
  return resolveImageUrl(iconUrl, env.apiUrl);
}

export function resolveServerBannerUrl(
  bannerUrl: string | null,
): string | null {
  return resolveImageUrl(bannerUrl, env.apiUrl);
}

export async function listMyServers(): Promise<ListServersResult> {
  const result = await apiFetch<ServerSummary[]>("/v1/servers", {
    method: "GET",
  });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, SERVERS_LOAD_FAILED),
    };
  }
  return { ok: true, servers: result.data };
}

export async function getServer(serverId: string): Promise<GetServerResult> {
  const result = await apiFetch<ServerSummary>(`/v1/servers/${serverId}`, {
    method: "GET",
  });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, SERVER_LOAD_FAILED),
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

  const formData = new FormData();
  formData.append("name", params.name);
  if (params.icon) {
    formData.append("icon", asUploadFile(params.icon), params.icon.name);
  }

  const res = await fetch(`${env.apiUrl}/v1/servers`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

export async function createServer(
  params: CreateServerParams,
): Promise<CreateServerResult> {
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

async function uploadServerFile(
  serverId: string,
  fieldName: "icon" | "banner",
  file: CreateServerIconInput,
  extraParams: Record<string, string>,
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const formData = new FormData();
  formData.append(fieldName, asUploadFile(file), file.name);
  for (const [key, value] of Object.entries(extraParams)) {
    formData.append(key, value);
  }

  const res = await fetch(`${env.apiUrl}/v1/servers/${serverId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

async function updateServerFieldsOnly(
  serverId: string,
  fields: Record<string, string>,
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const res = await fetch(`${env.apiUrl}/v1/servers/${serverId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

async function performServerUpdate(
  params: UpdateServerParams,
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const nameFields: Record<string, string> =
    params.name !== undefined ? { name: params.name } : {};
  const removeBannerFields: Record<string, string> = params.removeBanner
    ? { remove_banner: "true" }
    : {};

  if (params.icon && params.banner) {
    const iconResult = await uploadServerFile(
      params.serverId,
      "icon",
      params.icon,
      nameFields,
      token,
    );
    if (iconResult.status < 200 || iconResult.status >= 300) {
      return iconResult;
    }
    return uploadServerFile(
      params.serverId,
      "banner",
      params.banner,
      {},
      token,
    );
  }

  if (params.icon) {
    return uploadServerFile(
      params.serverId,
      "icon",
      params.icon,
      { ...nameFields, ...removeBannerFields },
      token,
    );
  }

  if (params.banner) {
    return uploadServerFile(
      params.serverId,
      "banner",
      params.banner,
      nameFields,
      token,
    );
  }

  return updateServerFieldsOnly(
    params.serverId,
    { ...nameFields, ...removeBannerFields },
    token,
  );
}

export async function updateServer(
  params: UpdateServerParams,
): Promise<UpdateServerResult> {
  let status: number;
  let rawBody: string;
  try {
    const token = await getToken();
    const first = await performServerUpdate(params, token);
    status = first.status;
    rawBody = first.rawBody;

    if (status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await performServerUpdate(params, newToken);
        status = retry.status;
        rawBody = retry.rawBody;
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.error("updateServer: request failed", err);
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

    if (
      (field === "name" || field === "icon" || field === "banner") &&
      friendly
    ) {
      return {
        ok: false,
        message: friendly,
        fieldErrors: { [field]: friendly },
      };
    }
    if (status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (status === 403) {
      return { ok: false, message: SERVER_UPDATE_FORBIDDEN };
    }
    return {
      ok: false,
      message: friendly ?? SERVER_UPDATE_FAILED,
    };
  }

  return { ok: true, server: body as ServerSummary };
}

export async function leaveServer(
  serverId: string,
  userId: string,
): Promise<LeaveServerResult> {
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
      message: messageFor(result, {}, SERVER_LEAVE_FAILED),
    };
  }

  return { ok: true };
}

export async function joinServerByCode(
  code: string,
): Promise<JoinServerResult> {
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
