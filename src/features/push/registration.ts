import {
  PUSH_DEVICE_REGISTER_FAILED,
  parsePushDeviceRequest,
} from "@discordia/client-shared";

import {
  ensureNotificationChannel,
  pushPlatform,
  readExpoPushToken,
} from "./device";
import { registerPushDevice, unregisterPushDevice } from "./service";
import {
  clearPushDeviceId,
  readPushDeviceId,
  writePushDeviceId,
} from "./storage";

export type RegisterThisDeviceResult =
  { ok: true } | { ok: false; message: string };

export async function registerThisDevice(
  userId: string,
): Promise<RegisterThisDeviceResult> {
  try {
    await ensureNotificationChannel();
    const token = await readExpoPushToken();
    const device = parsePushDeviceRequest({
      provider: "expo",
      platform: pushPlatform(),
      token,
    });
    if (!device) return { ok: false, message: PUSH_DEVICE_REGISTER_FAILED };

    const registered = await registerPushDevice(device);
    if (!registered.ok) return { ok: false, message: registered.message };

    await writePushDeviceId(userId, registered.id);
    return { ok: true };
  } catch {
    return { ok: false, message: PUSH_DEVICE_REGISTER_FAILED };
  }
}

export async function unregisterThisDevice(userId: string): Promise<boolean> {
  const deviceId = await readPushDeviceId(userId);
  if (!deviceId) return true;

  const result = await unregisterPushDevice(deviceId);
  if (!result.ok) return false;

  await clearPushDeviceId(userId);
  return true;
}

export async function unregisterOnLogout(userId: string): Promise<void> {
  try {
    await unregisterThisDevice(userId);
  } catch {
    return;
  }
}
