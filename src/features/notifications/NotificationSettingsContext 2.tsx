import type {
  NotificationSettings,
  NotificationSettingsPatch,
} from "@discordia/client-shared";

import { createContext, useContext } from "react";

import type { SaveNotificationSettingResult } from "./useNotificationSettings";

export interface NotificationSettingsValue {
  settings: NotificationSettings;
  setChannel: (
    channelId: string,
    patch: NotificationSettingsPatch,
  ) => Promise<SaveNotificationSettingResult>;
  setServer: (
    serverId: string,
    patch: NotificationSettingsPatch,
  ) => Promise<SaveNotificationSettingResult>;
}

const NotificationSettingsContext =
  createContext<NotificationSettingsValue | null>(null);

export const NotificationSettingsProvider =
  NotificationSettingsContext.Provider;

/** `null` fuera del home (por ejemplo en las pantallas de login). */
export function useOptionalNotificationSettings(): NotificationSettingsValue | null {
  return useContext(NotificationSettingsContext);
}
