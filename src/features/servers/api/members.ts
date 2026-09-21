import {
  type InitiateTransferResult,
  type ListMembersResult,
  MEMBER_REASONS,
  type MemberListResponse,
  MEMBERS_LOAD_FAILED,
  messageFor,
  OWNER_ONLY_TRANSFER,
  type OwnershipTransfer,
  reasonOf,
  SERVER_NOT_FOUND,
  SESSION_EXPIRED_MESSAGE,
  TRANSFER_REASONS,
  TRANSFER_START_FAILED,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";

export async function listMembers(
  serverId: string,
  params?: { limit?: number; offset?: number },
): Promise<ListMembersResult> {
  const query = new URLSearchParams();
  if (params?.limit != null) query.set("limit", String(params.limit));
  if (params?.offset != null) query.set("offset", String(params.offset));
  const qs = query.toString();

  const result = await apiFetch<MemberListResponse>(
    `/v1/servers/${serverId}/members${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );

  if (!result.ok) {
    const reason = reasonOf(result.details);
    if (!reason || !MEMBER_REASONS[reason]) {
      if (result.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (result.status === 404) {
        return { ok: false, message: SERVER_NOT_FOUND };
      }
    }
    return {
      ok: false,
      message: messageFor(result, MEMBER_REASONS, MEMBERS_LOAD_FAILED),
    };
  }

  return { ok: true, members: result.data.members, total: result.data.total };
}

export async function initiateOwnershipTransfer(
  serverId: string,
  toUserId: string,
): Promise<InitiateTransferResult> {
  const result = await apiFetch<OwnershipTransfer>(
    `/v1/servers/${serverId}/ownership-transfers`,
    { method: "POST", body: JSON.stringify({ to_user_id: toUserId }) },
  );

  if (!result.ok) {
    const reason = reasonOf(result.details);

    if (reason === "transfer_already_pending") {
      return {
        ok: false,
        message: "Ya hay una transferencia pendiente para este servidor.",
        reason: "transfer_already_pending",
      };
    }

    const fieldMessage = reason ? TRANSFER_REASONS[reason] : undefined;
    if (fieldMessage) {
      return {
        ok: false,
        message: fieldMessage,
        fieldErrors: { to_user_id: fieldMessage },
      };
    }

    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_TRANSFER,
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 404) {
      return { ok: false, message: SERVER_NOT_FOUND };
    }

    return {
      ok: false,
      message: messageFor(result, {}, TRANSFER_START_FAILED),
    };
  }

  return { ok: true, transfer: result.data };
}
