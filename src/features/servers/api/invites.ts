import { ApiError, NetworkError, apiFetch } from "../../../lib/api-client";
import type {
  GenerateInviteActionResult,
  Invitation,
  ListInvitationsActionResult,
  RevokeInviteActionResult,
} from "../types";
import {
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  reasonOf,
} from "./shared";

export function normalizeInviteCode(raw: string): string {
  const match = raw.trim().match(/([A-Za-z0-9_-]{4,20})$/);
  return match ? match[1] : raw.trim();
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

/**
 * Cualquier miembro puede ver todas las invitaciones del server (mismo
 * chequeo que generar/revocar).
 */
export async function listInvitations(
  serverId: string,
): Promise<ListInvitationsActionResult> {
  try {
    const invitations = await apiFetch<Invitation[]>(
      `/v1/servers/${serverId}/invites`,
      { method: "GET" },
    );
    return { ok: true, invitations };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return { ok: false, message: "No sos miembro de este servidor." };
      }
      if (err.status === 404) {
        return { ok: false, message: "Este servidor ya no existe." };
      }
    }

    return {
      ok: false,
      message: "No pudimos cargar las invitaciones. Intenta de nuevo.",
    };
  }
}
