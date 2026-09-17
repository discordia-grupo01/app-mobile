import * as FileSystem from "expo-file-system/legacy";

import {
  ApiError,
  NetworkError,
  apiFetch,
  refreshAccessToken,
} from "../../lib/api-client";
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

const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisá tu conexión a internet e intentá de nuevo.";
const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Volvé a iniciar sesión.";

/**
 * Perfil propio (`GET /v1/me/profile`). A diferencia de `getPublicUser` en
 * features/auth/service.ts (perfil de un tercero), este trae email y fecha
 * de registro.
 */
export async function getOwnProfile(): Promise<GetOwnProfileActionResult> {
  try {
    const user = await apiFetch<User>("/v1/me/profile", { method: "GET" });
    return { ok: true, user };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    return { ok: false, message: "No pudimos cargar tu perfil." };
  }
}

/**
 * Perfil público de otro usuario (`GET /v1/users/:id`). Es la misma
 * respuesta que `getPublicUser` (features/auth/service.ts), pero envuelta
 * como `ActionResult` con mensaje de error legible, igual que el resto de
 * esta feature -- se agrega acá en vez de cambiar la firma de
 * `getPublicUser` para no romper a quien ya la use.
 */
export async function getPublicProfile(
  userId: string,
): Promise<GetPublicProfileActionResult> {
  try {
    const user = await apiFetch<PublicUser>(`/v1/users/${userId}`, {
      method: "GET",
    });
    return { ok: true, user };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    return { ok: false, message: "No pudimos cargar el perfil." };
  }
}

/**
 * `PATCH /v1/me/profile` es multipart/form-data (name/description/image,
 * todos opcionales para el backend, pero acá se mandan siempre name +
 * description igual que en web-client's own-profile-modal.tsx: así ninguno
 * de los tres flujos -- nombre, descripción, foto -- depende de que el
 * backend interprete "campo ausente" como "no tocar", y el chequeo de
 * profile_service.go de "al menos un campo" nunca falla).
 *
 * Sigue el mismo patrón que `createServer` en features/servers/api/servers.ts:
 * `FileSystem.uploadAsync` (MULTIPART) cuando hay imagen nueva -- ya que
 * necesita leer un archivo local por URI --, `fetch` con `FormData` cuando
 * no la hay, y un reintento manual si el access token venció (esto no pasa
 * por `apiFetch`, que fuerza `Content-Type: application/json`).
 */
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
        "No pudimos actualizar tu perfil. Intenta de nuevo.",
    };
  }

  return { ok: true, user: body as User };
}

/** `PUT /v1/me/status`: el backend devuelve el usuario completo actualizado. */
export async function updateStatus(
  statusText: string,
): Promise<UpdateStatusActionResult> {
  try {
    const user = await apiFetch<User>("/v1/me/status", {
      method: "PUT",
      body: JSON.stringify({ status_text: statusText }),
    });
    return { ok: true, user };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError && err.status === 400) {
      return { ok: false, message: "Ese estado no es válido." };
    }
    return {
      ok: false,
      message: "No pudimos actualizar tu estado. Intenta de nuevo.",
    };
  }
}

/**
 * `DELETE /v1/me/status` devuelve 204 sin cuerpo (a diferencia de `PUT`,
 * ver profile_handler.go `DeleteStatus`), así que acá se arma el usuario
 * actualizado a partir de `currentUser` en vez de parsear una respuesta que
 * no existe -- `ClearStatus` en el backend siempre deja `status_text` y
 * `status_emoji` en "".
 */
export async function clearStatus(
  currentUser: User,
): Promise<UpdateStatusActionResult> {
  try {
    await apiFetch<void>("/v1/me/status", { method: "DELETE" });
    return {
      ok: true,
      user: { ...currentUser, status_text: "", status_emoji: "" },
    };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    return {
      ok: false,
      message: "No pudimos borrar tu estado. Intenta de nuevo.",
    };
  }
}
