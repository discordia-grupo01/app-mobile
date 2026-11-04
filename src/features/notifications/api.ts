import {
  type ListNotificationSettingsResult,
  NOTIFICATION_SETTINGS_LOAD_FAILED,
  NOTIFICATION_SETTINGS_SAVE_FAILED,
  type NotificationSettingsPatch,
  type NotificationSettingsResponse,
  type NotificationSettingState,
  type UpdateNotificationSettingsResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

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
