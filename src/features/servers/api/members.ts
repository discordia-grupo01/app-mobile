import { ApiError, NetworkError, apiFetch } from "../../../lib/api-client";
import type {
  InitiateTransferActionResult,
  ListMembersActionResult,
  MemberListResponse,
  OwnershipTransfer,
} from "../types";
import {
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  reasonOf,
} from "./shared";

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
