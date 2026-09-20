import * as FileSystem from "expo-file-system/legacy";

import {
  messageFor,
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch, refreshAccessToken } from "../../lib/api-client";
import { env } from "../../lib/env";
import { getToken } from "../../lib/storage";
import type { ApiErrorBody, PublicUser, User } from "../auth/types";
import type {
  GetOwnProfileActionResult,
  GetPublicProfileActionResult,
  PickedProfileImage,
  UpdateOwnProfileActionResult,
  UpdateStatusActionResult,
} from "./types";

export async function getOwnProfile(): Promise<GetOwnProfileActionResult> {
  const result = await apiFetch<User>("/v1/me/profile", { method: "GET" });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, "No pudimos cargar tu perfil."),
    };
  }
  return { ok: true, user: result.data };
}

export async function getPublicProfile(
  userId: string,
): Promise<GetPublicProfileActionResult> {
  const result = await apiFetch<PublicUser>(`/v1/users/${userId}`, {
    method: "GET",
  });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, "No pudimos cargar el perfil."),
    };
  }
  return { ok: true, user: result.data };
}

async function performProfileUpdate(
  params: { name: string; description: string; image?: PickedProfileImage },
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  if (params.image) {
    const uploadResult = await FileSystem.uploadAsync(
      `${env.apiUrl}/v1/me/profile`,
      params.image.uri,
      {
        httpMethod: "PATCH",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: params.image.type,
        parameters: { name: params.name, description: params.description },
        headers: authHeaders,
      },
    );
    return { status: uploadResult.status, rawBody: uploadResult.body };
  }

  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("description", params.description);
  const res = await fetch(`${env.apiUrl}/v1/me/profile`, {
    method: "PATCH",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

export async function updateOwnProfile(params: {
  name: string;
  description: string;
  image?: PickedProfileImage;
}): Promise<UpdateOwnProfileActionResult> {
  let status: number;
  let rawBody: string;
  try {
    const token = await getToken();
    const first = await performProfileUpdate(params, token);
    status = first.status;
    rawBody = first.rawBody;

    if (status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await performProfileUpdate(params, newToken);
        status = retry.status;
        rawBody = retry.rawBody;
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.error("updateOwnProfile: request failed", err);
    }
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {}

  if (status < 200 || status >= 300) {
    if (status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    const errBody = body as ApiErrorBody | undefined;
    return {
      ok: false,
      message:
        errBody?.error?.message ??
        "No pudimos actualizar tu perfil. Intentá de nuevo.",
    };
  }

  return { ok: true, user: body as User };
}

export async function updateStatus(
  statusText: string,
): Promise<UpdateStatusActionResult> {
  const result = await apiFetch<User>("/v1/me/status", {
    method: "PUT",
    body: JSON.stringify({ status_text: statusText }),
  });

  if (!result.ok) {
    if (result.status === 400) {
      return { ok: false, message: "Ese estado no es válido." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos actualizar tu estado. Intentá de nuevo.",
      ),
    };
  }
  return { ok: true, user: result.data };
}

export async function clearStatus(
  currentUser: User,
): Promise<UpdateStatusActionResult> {
  const result = await apiFetch<void>("/v1/me/status", { method: "DELETE" });
  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos borrar tu estado. Intentá de nuevo.",
      ),
    };
  }
  return {
    ok: true,
    user: { ...currentUser, status_text: "", status_emoji: "" },
  };
}
