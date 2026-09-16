import { ApiError, NetworkError, apiFetch } from "../../../lib/api-client";
import type {
  Category,
  Channel,
  CreateCategoryActionResult,
  CreateChannelActionResult,
  DeleteChannelActionResult,
  ReorderChannelsActionResult,
  UpdateChannelActionResult,
} from "../types";
import {
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  fieldOf,
  reasonOf,
} from "./shared";

const CREATE_CHANNEL_REASON_MESSAGES: Record<string, string> = {
  name_required: "Ingresá un nombre para el canal.",
  name_too_long: "El nombre es demasiado largo.",
  name_invalid_chars: "El nombre tiene caracteres inválidos.",
  name_taken: "Ya existe un canal con ese nombre en esa categoría.",
  kind_invalid: "El tipo de canal debe ser texto o voz.",
  category_server_mismatch: "Esa categoría no pertenece a este servidor.",
};

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
): Promise<CreateChannelActionResult> {
  try {
    const channel = await apiFetch<Channel>(
      `/v1/servers/${serverId}/channels`,
      {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          kind: input.kind,
          ...(input.categoryId ? { category_id: input.categoryId } : {}),
        }),
      },
    );
    return { ok: true, channel };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      const field = fieldOf(err);
      const friendly = reason
        ? CREATE_CHANNEL_REASON_MESSAGES[reason]
        : undefined;

      if (field && friendly && (field === "name" || field === "kind")) {
        return {
          ok: false,
          message: friendly,
          fieldErrors: { [field]: friendly },
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede crear canales.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
      return {
        ok: false,
        message: friendly ?? "No pudimos crear el canal. Intenta de nuevo.",
      };
    }

    return {
      ok: false,
      message: "No pudimos crear el canal. Intenta de nuevo.",
    };
  }
}

const UPDATE_CHANNEL_REASON_MESSAGES: Record<string, string> = {
  name_required: "Ingresá un nombre para el canal.",
  name_too_long: "El nombre es demasiado largo.",
  name_invalid_chars: "El nombre tiene caracteres inválidos.",
  name_taken: "Ya existe un canal con ese nombre en esa categoría.",
};

/**
 * `PATCH /v1/channels/:id` contra el gateway. Solo el owner del server puede
 * editar canales (el back devuelve 403 si no).
 */
export async function updateChannel(
  channelId: string,
  input: { name: string },
): Promise<UpdateChannelActionResult> {
  try {
    const channel = await apiFetch<Channel>(`/v1/channels/${channelId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return { ok: true, channel };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      const field = fieldOf(err);
      const friendly = reason
        ? UPDATE_CHANNEL_REASON_MESSAGES[reason]
        : undefined;

      if (field === "name" && friendly) {
        return {
          ok: false,
          message: friendly,
          fieldErrors: { name: friendly },
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede editar canales.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este canal ya no existe." };
      }
      return {
        ok: false,
        message: friendly ?? "No pudimos editar el canal. Intenta de nuevo.",
      };
    }

    return {
      ok: false,
      message: "No pudimos editar el canal. Intenta de nuevo.",
    };
  }
}

/**
 * `DELETE /v1/channels/:id` contra el gateway. Solo el owner del server
 * puede eliminar canales (el back devuelve 403 si no). Idempotente del lado
 * del back para un id que ya no existe (404, ya tratado como error acá).
 */
export async function deleteChannel(
  channelId: string,
): Promise<DeleteChannelActionResult> {
  try {
    await apiFetch<void>(`/v1/channels/${channelId}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede eliminar canales.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este canal ya no existe." };
      }
    }

    return {
      ok: false,
      message: "No pudimos eliminar el canal. Intenta de nuevo.",
    };
  }
}

const REORDER_CHANNELS_REASON_MESSAGES: Record<string, string> = {
  channel_set_mismatch:
    "La lista de canales cambió mientras reordenabas. Recargá e intentá de nuevo.",
  category_server_mismatch: "Esa categoría no pertenece a este servidor.",
};

/**
 * `PATCH /v1/servers/:id/channels/reorder` contra el gateway. Solo el owner
 * del server puede reordenar canales. `categoryId` es `null` para reordenar
 * dentro del balde "Sin categoría".
 */
export async function reorderChannels(
  serverId: string,
  categoryId: string | null,
  channelIds: string[],
): Promise<ReorderChannelsActionResult> {
  try {
    await apiFetch<void>(`/v1/servers/${serverId}/channels/reorder`, {
      method: "PATCH",
      body: JSON.stringify({
        category_id: categoryId,
        channel_ids: channelIds,
      }),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      const friendly = reason
        ? REORDER_CHANNELS_REASON_MESSAGES[reason]
        : undefined;

      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede reordenar canales.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
      return {
        ok: false,
        message:
          friendly ?? "No pudimos reordenar los canales. Intenta de nuevo.",
      };
    }

    return {
      ok: false,
      message: "No pudimos reordenar los canales. Intenta de nuevo.",
    };
  }
}

const CREATE_CATEGORY_REASON_MESSAGES: Record<string, string> = {
  name_required: "Ingresá un nombre para la categoría.",
  name_too_long: "El nombre es demasiado largo.",
  name_invalid_chars: "El nombre tiene caracteres inválidos.",
};

/**
 * `POST /v1/servers/:id/categories` contra el gateway. Solo el owner del
 * server puede crear categorías (el back devuelve 403 si no).
 */
export async function createCategory(
  serverId: string,
  name: string,
): Promise<CreateCategoryActionResult> {
  try {
    const category = await apiFetch<Category>(
      `/v1/servers/${serverId}/categories`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );
    return { ok: true, category };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const reason = reasonOf(err);
      const field = fieldOf(err);
      const friendly = reason
        ? CREATE_CATEGORY_REASON_MESSAGES[reason]
        : undefined;

      if (field === "name" && friendly) {
        return {
          ok: false,
          message: friendly,
          fieldErrors: { name: friendly },
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede crear categorías.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
      return {
        ok: false,
        message: friendly ?? "No pudimos crear la categoría. Intenta de nuevo.",
      };
    }

    return {
      ok: false,
      message: "No pudimos crear la categoría. Intenta de nuevo.",
    };
  }
}
