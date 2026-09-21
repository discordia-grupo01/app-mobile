import {
  type Category,
  CATEGORY_CREATE_FAILED,
  CATEGORY_REASONS,
  type Channel,
  CHANNEL_CREATE_FAILED,
  CHANNEL_DELETE_FAILED,
  CHANNEL_NOT_FOUND,
  CHANNEL_REASONS,
  CHANNEL_REORDER_FAILED,
  CHANNEL_UPDATE_FAILED,
  type CreateCategoryResult,
  type CreateChannelResult,
  type DeleteChannelResult,
  fieldOf,
  messageFor,
  OWNER_ONLY_CREATE_CATEGORY,
  OWNER_ONLY_CREATE_CHANNEL,
  OWNER_ONLY_DELETE_CHANNEL,
  OWNER_ONLY_REORDER_CHANNEL,
  OWNER_ONLY_UPDATE_CHANNEL,
  reasonOf,
  type ReorderChannelsResult,
  SERVER_NOT_FOUND,
  SESSION_EXPIRED_MESSAGE,
  type UpdateChannelResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";

interface CreateChannelInput {
  name: string;
  kind: "text" | "voice";
  categoryId?: string;
}

/**
 * `POST /v1/servers/:id/channels` contra el gateway. Solo el owner del
 * server puede crear canales (el back devuelve 403 si no).
 */
export async function createChannel(
  serverId: string,
  input: CreateChannelInput,
): Promise<CreateChannelResult> {
  const result = await apiFetch<Channel>(`/v1/servers/${serverId}/channels`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      kind: input.kind,
      ...(input.categoryId ? { category_id: input.categoryId } : {}),
    }),
  });

  if (!result.ok) {
    const reason = reasonOf(result.details);
    const field = fieldOf(result.details);
    const friendly = reason ? CHANNEL_REASONS[reason] : undefined;

    if (friendly && (field === "name" || field === "kind")) {
      return {
        ok: false,
        message: friendly,
        fieldErrors: { [field]: friendly },
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: OWNER_ONLY_CREATE_CHANNEL };
    }
    if (result.status === 404) {
      return { ok: false, message: SERVER_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, CHANNEL_REASONS, CHANNEL_CREATE_FAILED),
    };
  }

  return { ok: true, channel: result.data };
}

/**
 * `PATCH /v1/channels/:id` contra el gateway. Solo el owner del server puede
 * editar canales (el back devuelve 403 si no).
 */
export async function updateChannel(
  channelId: string,
  input: { name: string },
): Promise<UpdateChannelResult> {
  const result = await apiFetch<Channel>(`/v1/channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    const reason = reasonOf(result.details);
    const field = fieldOf(result.details);
    const friendly = reason ? CHANNEL_REASONS[reason] : undefined;

    if (field === "name" && friendly) {
      return { ok: false, message: friendly, fieldErrors: { name: friendly } };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_UPDATE_CHANNEL,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: CHANNEL_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, CHANNEL_REASONS, CHANNEL_UPDATE_FAILED),
    };
  }

  return { ok: true, channel: result.data };
}

/**
 * `DELETE /v1/channels/:id` contra el gateway. Solo el owner del server
 * puede eliminar canales (el back devuelve 403 si no). Idempotente del lado
 * del back para un id que ya no existe (404, ya tratado como error acá).
 */
export async function deleteChannel(
  channelId: string,
): Promise<DeleteChannelResult> {
  const result = await apiFetch<void>(`/v1/channels/${channelId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_DELETE_CHANNEL,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: CHANNEL_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, CHANNEL_DELETE_FAILED),
    };
  }

  return { ok: true };
}

/**
 * `PATCH /v1/servers/:id/channels/reorder` contra el gateway. Solo el owner
 * del server puede reordenar canales. `categoryId` es `null` para reordenar
 * dentro del balde "Sin categoría".
 */
export async function reorderChannels(
  serverId: string,
  categoryId: string | null,
  channelIds: string[],
): Promise<ReorderChannelsResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/channels/reorder`,
    {
      method: "PATCH",
      body: JSON.stringify({
        category_id: categoryId,
        channel_ids: channelIds,
      }),
    },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_REORDER_CHANNEL,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: SERVER_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, CHANNEL_REASONS, CHANNEL_REORDER_FAILED),
    };
  }

  return { ok: true };
}

/**
 * `POST /v1/servers/:id/categories` contra el gateway. Solo el owner del
 * server puede crear categorías (el back devuelve 403 si no).
 */
export async function createCategory(
  serverId: string,
  name: string,
): Promise<CreateCategoryResult> {
  const result = await apiFetch<Category>(
    `/v1/servers/${serverId}/categories`,
    { method: "POST", body: JSON.stringify({ name }) },
  );

  if (!result.ok) {
    const reason = reasonOf(result.details);
    const field = fieldOf(result.details);
    const friendly = reason ? CATEGORY_REASONS[reason] : undefined;

    if (field === "name" && friendly) {
      return { ok: false, message: friendly, fieldErrors: { name: friendly } };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_CREATE_CATEGORY,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: SERVER_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, CATEGORY_REASONS, CATEGORY_CREATE_FAILED),
    };
  }

  return { ok: true, category: result.data };
}
