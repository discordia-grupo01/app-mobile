import {
  applyChannelNotificationSetting,
  applyServerNotificationSetting,
  channelNotificationLevel,
  isChannelMuted,
  isServerMuted,
  NO_NOTIFICATION_SETTINGS,
  type NotificationSettings,
  type NotificationSettingsPatch,
  type NotificationSettingState,
  parseNotificationSettings,
  serverNotificationLevel,
} from "@discordia/client-shared";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import {
  listNotificationSettings,
  updateChannelNotificationSettings,
  updateServerNotificationSettings,
} from "./api";

export type SaveNotificationSettingResult =
  { ok: true } | { ok: false; message: string };

export type NotificationScope = "channel" | "server";

interface SettingsStore {
  get: () => NotificationSettings;
  set: (next: NotificationSettings) => void;
}

const SCOPES = {
  channel: {
    apply: applyChannelNotificationSetting,
    read: (
      settings: NotificationSettings,
      id: string,
    ): NotificationSettingState => ({
      muted: isChannelMuted(settings, id),
      level: channelNotificationLevel(settings, id),
    }),
    request: updateChannelNotificationSettings,
  },
  server: {
    apply: applyServerNotificationSetting,
    read: (
      settings: NotificationSettings,
      id: string,
    ): NotificationSettingState => ({
      muted: isServerMuted(settings, id),
      level: serverNotificationLevel(settings, id),
    }),
    request: updateServerNotificationSettings,
  },
} as const;

export async function saveNotificationSetting(
  store: SettingsStore,
  scope: NotificationScope,
  id: string,
  patch: NotificationSettingsPatch,
): Promise<SaveNotificationSettingResult> {
  const { apply, read, request } = SCOPES[scope];
  const before = read(store.get(), id);
  store.set(apply(store.get(), id, patch));

  const result = await request(id, patch);
  if (result.ok) {
    store.set(
      apply(store.get(), id, { muted: result.muted, level: result.level }),
    );
    return { ok: true };
  }

  store.set(apply(store.get(), id, before));
  return { ok: false, message: result.message };
}

export function useNotificationSettings(userId: string | null) {
  const [settings, setSettings] = useState<NotificationSettings>(
    NO_NOTIFICATION_SETTINGS,
  );
  const current = useRef(settings);
  const pendingSaves = useRef(0);

  const commit = useCallback((next: NotificationSettings) => {
    current.current = next;
    setSettings(next);
  }, []);

  const reload = useCallback(async () => {
    const result = await listNotificationSettings();
    if (result.ok && pendingSaves.current === 0) {
      commit(parseNotificationSettings(result));
    }
  }, [commit]);

  useEffect(() => {
    if (!userId) return undefined;
    void reload();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void reload();
    });
    return () => subscription.remove();
  }, [userId, reload]);

  const save = useCallback(
    async (
      scope: NotificationScope,
      id: string,
      patch: NotificationSettingsPatch,
    ): Promise<SaveNotificationSettingResult> => {
      pendingSaves.current += 1;
      const result = await saveNotificationSetting(
        { get: () => current.current, set: commit },
        scope,
        id,
        patch,
      );
      pendingSaves.current -= 1;
      return result;
    },
    [commit],
  );

  const setChannel = useCallback(
    (channelId: string, patch: NotificationSettingsPatch) =>
      save("channel", channelId, patch),
    [save],
  );

  const setServer = useCallback(
    (serverId: string, patch: NotificationSettingsPatch) =>
      save("server", serverId, patch),
    [save],
  );

  return { settings, reload, setChannel, setServer };
}

export type NotificationSettingsState = ReturnType<
  typeof useNotificationSettings
>;
