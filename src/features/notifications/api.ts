import {
  type ListNotificationHistoryResult,
  type ListNotificationSettingsResult,
  NOTIFICATIONS_LOAD_FAILED,
  type NotificationHistoryQuery,
  type NotificationHistoryResponse,
  NOTIFICATION_SETTINGS_LOAD_FAILED,
  NOTIFICATION_SETTINGS_SAVE_FAILED,
  type NotificationSettingsPatch,
  type NotificationSettingsResponse,
  type NotificationSettingState,
  type SocketTicketResult,
  type UpdateNotificationSettingsResult,
  isAccountSuspended,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function listNotificationHistory({
  limit,
  before,
}: NotificationHistoryQuery = {}): Promise<ListNotificationHistoryResult> {
  const query = new URLSearchParams();
  if (limit !== undefined) query.set("limit", String(limit));
  if (before) query.set("before", before);
  const qs = query.toString();

  const result = await apiFetch<NotificationHistoryResponse>(
    `/v1/notifications/history${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
  if (!result.ok || !Array.isArray(result.data?.items)) {
    return { ok: false, message: NOTIFICATIONS_LOAD_FAILED };
  }
  return {
    ok: true,
    items: result.data.items,
    nextCursor: result.data.next_cursor ?? null,
  };
}

export async function listNotificationSettings(): Promise<ListNotificationSettingsResult> {
  const result = await apiFetch<NotificationSettingsResponse>(
    "/v1/notifications/settings",
    { method: "GET" },
  );
  if (!result.ok || !isSettingsResponse(result.data)) {
    return { ok: false, message: NOTIFICATION_SETTINGS_LOAD_FAILED };
  }
  return { ok: true, ...result.data };
}

export function updateChannelNotificationSettings(
  channelId: string,
  patch: NotificationSettingsPatch,
): Promise<UpdateNotificationSettingsResult> {
  return updateNotificationSettings(
    `/v1/notifications/settings/channels/${encodeURIComponent(channelId)}`,
    patch,
  );
}

export function updateServerNotificationSettings(
  serverId: string,
  patch: NotificationSettingsPatch,
): Promise<UpdateNotificationSettingsResult> {
  return updateNotificationSettings(
    `/v1/notifications/settings/servers/${encodeURIComponent(serverId)}`,
    patch,
  );
}

async function updateNotificationSettings(
  path: string,
  patch: NotificationSettingsPatch,
): Promise<UpdateNotificationSettingsResult> {
  const result = await apiFetch<NotificationSettingState>(path, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  if (!result.ok || typeof result.data?.muted !== "boolean") {
    return { ok: false, message: NOTIFICATION_SETTINGS_SAVE_FAILED };
  }
  return {
    ok: true,
    muted: result.data.muted,
    level: result.data.level ?? null,
  };
}

function isSettingsResponse(
  data: NotificationSettingsResponse | undefined,
): data is NotificationSettingsResponse {
  return (
    Array.isArray(data?.servers) &&
    Array.isArray(data?.channels) &&
    Array.isArray(data?.preferences?.servers) &&
    Array.isArray(data?.preferences?.channels)
  );
}

export async function fetchUnreadSocketTicket(): Promise<SocketTicketResult> {
  const result = await apiFetch<{ ticket?: string }>(
    "/v1/notifications/socket-tickets",
    { method: "POST" },
  );
  if (result.ok && typeof result.data?.ticket === "string") {
    return { ok: true, ticket: result.data.ticket };
  }
  if (result.ok) return { ok: false, sessionExpired: false };
  return {
    ok: false,
    sessionExpired: result.status === 401,
    accountSuspended: isAccountSuspended(result),
  };
}
