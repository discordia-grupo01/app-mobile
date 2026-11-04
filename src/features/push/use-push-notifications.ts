import {
  PUSH_DEVICE_UNREGISTER_FAILED,
  PUSH_SETTINGS_SAVE_FAILED,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import {
  isPushSupported,
  readPushPermission,
  requestPushPermission,
} from "./device";
import { registerThisDevice, unregisterThisDevice } from "./registration";
import { getPushSettings, updatePushSettings } from "./service";
import { isPushWanted, markPushWanted, readPushDeviceId } from "./storage";

export type PushDeviceStatus =
  "loading" | "unsupported" | "denied" | "off" | "on";

export function usePushDeviceSync(userId: string | null) {
  useEffect(() => {
    if (!userId || !isPushSupported()) return;
    let isCancelled = false;

    void (async () => {
      if (!(await isPushWanted(userId))) return;
      if ((await readPushPermission()) !== "granted") return;
      if (!isCancelled) await registerThisDevice(userId);
    })();

    return () => {
      isCancelled = true;
    };
  }, [userId]);
}

async function readDeviceStatus(
  userId: string | null,
): Promise<PushDeviceStatus> {
  if (!isPushSupported()) return "unsupported";
  const permission = await readPushPermission();
  if (permission === "denied") return "denied";
  if (!userId) return "off";
  const deviceId = await readPushDeviceId(userId);
  return permission === "granted" && deviceId ? "on" : "off";
}

export function usePushNotifications(userId: string | null) {
  const [accountEnabled, setAccountEnabledState] = useState<boolean | null>(
    null,
  );
  const [deviceStatus, setDeviceStatus] = useState<PushDeviceStatus>("loading");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void getPushSettings().then((result) => {
      if (isCancelled) return;
      if (result.ok) setAccountEnabledState(result.enabled);
      else setError(result.message);
    });

    const refreshStatus = () => {
      void readDeviceStatus(userId).then((status) => {
        if (!isCancelled) setDeviceStatus(status);
      });
    };
    refreshStatus();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshStatus();
    });

    return () => {
      isCancelled = true;
      subscription.remove();
    };
  }, [userId]);

  const setAccountEnabled = useCallback(
    async (enabled: boolean) => {
      const previous = accountEnabled;
      setError(null);
      setAccountEnabledState(enabled);
      const result = await updatePushSettings(enabled);
      if (result.ok) {
        setAccountEnabledState(result.enabled);
        return;
      }
      setAccountEnabledState(previous);
      setError(result.message || PUSH_SETTINGS_SAVE_FAILED);
    },
    [accountEnabled],
  );

  const enableDevice = useCallback(async () => {
    if (!userId || !isPushSupported()) return;
    setIsBusy(true);
    setError(null);

    let permission = await readPushPermission();
    if (permission === "askable") permission = await requestPushPermission();

    if (permission !== "granted") {
      setDeviceStatus(permission === "denied" ? "denied" : "off");
      setIsBusy(false);
      return;
    }

    const result = await registerThisDevice(userId);
    if (result.ok) {
      await markPushWanted(userId, true);
      setDeviceStatus("on");
    } else {
      setError(result.message);
    }
    setIsBusy(false);
  }, [userId]);

  const disableDevice = useCallback(async () => {
    if (!userId) return;
    setIsBusy(true);
    setError(null);

    const removed = await unregisterThisDevice(userId);
    if (removed) {
      await markPushWanted(userId, false);
      setDeviceStatus("off");
    } else {
      setError(PUSH_DEVICE_UNREGISTER_FAILED);
    }
    setIsBusy(false);
  }, [userId]);

  return {
    accountEnabled,
    deviceStatus,
    isBusy,
    error,
    setAccountEnabled,
    enableDevice,
    disableDevice,
  };
}
