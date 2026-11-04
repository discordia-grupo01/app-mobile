import {
  type LoadPushSettingsResult,
  PUSH_DEVICE_LIMIT_REACHED,
  PUSH_DEVICE_REGISTER_FAILED,
  PUSH_DEVICE_UNREGISTER_FAILED,
  PUSH_SETTINGS_LOAD_FAILED,
  PUSH_SETTINGS_SAVE_FAILED,
  type PushDevice,
  type PushDeviceRequest,
  type PushSettings,
  type RegisterPushDeviceResult,
  type SavePushSettingsResult,
  type UnregisterPushDeviceResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function getPushSettings(): Promise<LoadPushSettingsResult> {
  const result = await apiFetch<PushSettings>(
    "/v1/notifications/push/settings",
    { method: "GET" },
  );
  if (!result.ok) return { ok: false, message: PUSH_SETTINGS_LOAD_FAILED };
  return { ok: true, enabled: result.data.enabled };
}

export async function updatePushSettings(
  enabled: boolean,
): Promise<SavePushSettingsResult> {
  const result = await apiFetch<PushSettings>(
    "/v1/notifications/push/settings",
    { method: "PUT", body: JSON.stringify({ enabled }) },
  );
  if (!result.ok) return { ok: false, message: PUSH_SETTINGS_SAVE_FAILED };
  return { ok: true, enabled: result.data.enabled };
}

export async function registerPushDevice(
  device: PushDeviceRequest,
): Promise<RegisterPushDeviceResult> {
  const result = await apiFetch<PushDevice>("/v1/notifications/push/devices", {
    method: "POST",
    body: JSON.stringify(device),
  });
  if (result.ok) return { ok: true, id: result.data.id };
  if (result.status === 409) {
    return {
      ok: false,
      message: PUSH_DEVICE_LIMIT_REACHED,
      limitReached: true,
    };
  }
  return { ok: false, message: PUSH_DEVICE_REGISTER_FAILED };
}

export async function unregisterPushDevice(
  deviceId: string,
): Promise<UnregisterPushDeviceResult> {
  const result = await apiFetch<null>(
    `/v1/notifications/push/devices/${encodeURIComponent(deviceId)}`,
    { method: "DELETE" },
  );
  if (!result.ok) return { ok: false, message: PUSH_DEVICE_UNREGISTER_FAILED };
  return { ok: true };
}
