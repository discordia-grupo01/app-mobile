import {
  INVITE_CREATE_FAILED,
  INVITE_NOT_FOUND,
  INVITE_REASONS,
  INVITE_REVOKE_FAILED,
  INVITES_LOAD_FAILED,
  messageFor,
  NOT_A_MEMBER,
  reasonOf,
  SERVER_NOT_FOUND,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";
import type {
  GenerateInviteActionResult,
  Invitation,
  ListInvitationsActionResult,
  RevokeInviteActionResult,
} from "../types";

export function normalizeInviteCode(raw: string): string {
  const match = raw.trim().match(/([A-Za-z0-9_-]{4,20})$/);
  return match ? match[1] : raw.trim();
}

export function inviteLinkText(code: string): string {
  return `/invite/${code}`;
}

export async function generateInvite(
  serverId: string,
  maxUses: number | null,
): Promise<GenerateInviteActionResult> {
  const result = await apiFetch<Invitation>(`/v1/servers/${serverId}/invites`, {
    method: "POST",
    body: JSON.stringify(maxUses != null ? { max_uses: maxUses } : {}),
  });

  if (!result.ok) {
    const reason = reasonOf(result.details);

    // Este ademas marca el campo del formulario.
    if (reason === "max_uses_invalid") {
      const message = INVITE_REASONS[reason];
      return { ok: false, message, fieldErrors: { maxUses: message } };
    }

    if (!reason || !INVITE_REASONS[reason]) {
      if (result.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (result.status === 404) {
        return { ok: false, message: SERVER_NOT_FOUND };
      }
    }

    return {
      ok: false,
      message: messageFor(result, INVITE_REASONS, INVITE_CREATE_FAILED),
    };
  }

  return { ok: true, invitation: result.data };
}

export async function revokeInvite(
  code: string,
): Promise<RevokeInviteActionResult> {
  const result = await apiFetch<void>(
    `/v1/invites/${encodeURIComponent(code)}`,
    { method: "DELETE" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 404) {
      return { ok: false, message: INVITE_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, INVITE_REVOKE_FAILED),
    };
  }

  return { ok: true };
}

/**
 * Cualquier miembro puede ver todas las invitaciones del server (mismo
 * chequeo que generar/revocar).
 */
export async function listInvitations(
  serverId: string,
): Promise<ListInvitationsActionResult> {
  const result = await apiFetch<Invitation[]>(
    `/v1/servers/${serverId}/invites`,
    { method: "GET" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: NOT_A_MEMBER };
    }
    if (result.status === 404) {
      return { ok: false, message: SERVER_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, INVITES_LOAD_FAILED),
    };
  }

  return { ok: true, invitations: result.data };
}
