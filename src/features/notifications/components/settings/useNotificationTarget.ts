import {
  channelNotificationLevel,
  configuredChannelLevel,
  configuredServerLevel,
  isChannelMuted,
  isServerMuted,
  type NotificationLevel,
  type NotificationSettingsPatch,
  serverNotificationLevel,
} from "@discordia/client-shared";

import { useState } from "react";

import { useOptionalNotificationSettings } from "../../NotificationSettingsContext";

export interface NotificationTarget {
  scope: "channel" | "server";
  targetId: string;
  serverId: string;
  name: string;
}

export function useNotificationTarget(target: NotificationTarget | null) {
  const context = useOptionalNotificationSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!context || !target) return null;

  const { settings, setChannel, setServer } = context;
  const { scope, targetId, serverId } = target;
  const isChannel = scope === "channel";

  const isMuted = isChannel
    ? isChannelMuted(settings, targetId)
    : isServerMuted(settings, targetId);
  const isServerSilenced = isChannel && isServerMuted(settings, serverId);
  const explicitLevel: NotificationLevel | null = isChannel
    ? channelNotificationLevel(settings, targetId)
    : serverNotificationLevel(settings, targetId);
  const configuredLevel = isChannel
    ? configuredChannelLevel(settings, serverId, targetId)
    : configuredServerLevel(settings, targetId);

  async function save(patch: NotificationSettingsPatch) {
    setIsSaving(true);
    setErrorMessage(null);
    const result = isChannel
      ? await setChannel(targetId, patch)
      : await setServer(targetId, patch);
    setIsSaving(false);
    if (!result.ok) setErrorMessage(result.message);
  }

  return {
    isChannel,
    isMuted,
    isServerSilenced,
    explicitLevel,
    configuredLevel,
    followsParent: explicitLevel === null,
    isSaving,
    errorMessage,
    toggleMuted: () => void save({ muted: !isMuted }),
    selectLevel: (level: NotificationLevel) => {
      if (level !== explicitLevel) void save({ level });
    },
    resetLevel: () => void save({ level: null }),
    clearError: () => setErrorMessage(null),
  };
}
