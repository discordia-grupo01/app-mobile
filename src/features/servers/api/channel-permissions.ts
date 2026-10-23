import {
  type ApiFailure,
  CHANNEL_NOT_FOUND,
  CHANNEL_OVERRIDE_REASONS,
  CHANNEL_PERMISSIONS_LOAD_FAILED,
  CHANNEL_PERMISSIONS_SAVE_FAILED,
  type ChannelOverride,
  type ChannelOverridePermission,
  type DeleteChannelOverrideResult,
  type ListChannelOverridesResult,
  MEMBER_PERMISSIONS_LOAD_FAILED,
  type MemberPermissionsResult,
  messageFor,
  OWNER_ONLY_OVERRIDE_CHANNEL_PERMISSIONS,
  permissionNotHeldMessage,
  reasonOf,
  SESSION_EXPIRED_MESSAGE,
  type SetChannelOverrideResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";

interface OverrideFailure {
  ok: false;
  message: string;
  permissionDenied?: boolean;
}

function overrideFailure(
  failure: ApiFailure,
  fallback: string,
): OverrideFailure {
  const reason = reasonOf(failure.details);

  if (reason === "permission_not_held") {
    return {
      ok: false,
      message: permissionNotHeldMessage(failure.details?.permissions),
    };
  }
  if (reason && CHANNEL_OVERRIDE_REASONS[reason]) {
    return { ok: false, message: CHANNEL_OVERRIDE_REASONS[reason] };
  }
  if (failure.status === 401) {
    return { ok: false, message: SESSION_EXPIRED_MESSAGE };
  }
  if (failure.status === 403) {
    return {
      ok: false,
      message: OWNER_ONLY_OVERRIDE_CHANNEL_PERMISSIONS,
      permissionDenied: true,
    };
  }
  if (failure.status === 404) {
    return { ok: false, message: CHANNEL_NOT_FOUND };
  }
  return {
    ok: false,
    message: messageFor(failure, CHANNEL_OVERRIDE_REASONS, fallback),
  };
}

export async function listChannelOverrides(
  channelId: string,
): Promise<ListChannelOverridesResult> {
  const result = await apiFetch<ChannelOverride[]>(
    `/v1/channels/${channelId}/permissions`,
    { method: "GET" },
  );
  if (!result.ok) {
    const { message } = overrideFailure(
      result,
      CHANNEL_PERMISSIONS_LOAD_FAILED,
    );
    return { ok: false, message };
  }
  return { ok: true, overrides: result.data ?? [] };
}

/** Con `allow` y `deny` vacios el back borra la excepcion y responde 204. */
export async function setChannelOverride(
  channelId: string,
  roleId: string,
  input: {
    allow: ChannelOverridePermission[];
    deny: ChannelOverridePermission[];
  },
): Promise<SetChannelOverrideResult> {
  const result = await apiFetch<ChannelOverride | null>(
    `/v1/channels/${channelId}/permissions/roles/${roleId}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
  if (!result.ok) {
    return overrideFailure(result, CHANNEL_PERMISSIONS_SAVE_FAILED);
  }
  return { ok: true, override: result.data ?? null };
}

export async function deleteChannelOverride(
  channelId: string,
  roleId: string,
): Promise<DeleteChannelOverrideResult> {
  const result = await apiFetch<void>(
    `/v1/channels/${channelId}/permissions/roles/${roleId}`,
    { method: "DELETE" },
  );
  if (!result.ok) {
    // Ya no habia excepcion: el resultado es el mismo que borrarla.
    if (reasonOf(result.details) === "channel_override_not_found") {
      return { ok: true };
    }
    return overrideFailure(result, CHANNEL_PERMISSIONS_SAVE_FAILED);
  }
  return { ok: true };
}

/** Lo que `userId` puede hacer en el canal, con las excepciones aplicadas. */
export async function getMemberChannelPermissions(
  channelId: string,
  userId: string,
): Promise<MemberPermissionsResult> {
  const result = await apiFetch<{ permissions: string[] }>(
    `/v1/channels/${channelId}/members/${userId}/permissions`,
    { method: "GET" },
  );
  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 401
          ? SESSION_EXPIRED_MESSAGE
          : MEMBER_PERMISSIONS_LOAD_FAILED,
    };
  }
  return { ok: true, permissions: result.data.permissions };
}
