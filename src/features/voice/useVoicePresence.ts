import {
  VOICE_PARTICIPANTS_POLL_MS,
  type VoicePresenceByChannel,
} from "@discordia/client-shared";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { listVoiceParticipants } from "./api";

const EMPTY: VoicePresenceByChannel = {};

export function useVoicePresence(serverId: string | null): {
  byChannel: VoicePresenceByChannel;
  refresh: () => void;
} {
  const [presence, setPresence] = useState<{
    serverId: string | null;
    byChannel: VoicePresenceByChannel;
  }>({ serverId, byChannel: EMPTY });
  const requestId = useRef(0);

  const refresh = useCallback(() => {
    if (!serverId) return;
    const id = ++requestId.current;
    void listVoiceParticipants(serverId).then((result) => {
      if (id !== requestId.current || !result.ok) return;
      setPresence({ serverId, byChannel: result.byChannel });
    });
  }, [serverId]);

  useEffect(() => {
    if (!serverId) return;
    refresh();
    const timer = setInterval(() => {
      if (AppState.currentState === "active") refresh();
    }, VOICE_PARTICIPANTS_POLL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
      requestId.current += 1;
    };
  }, [serverId, refresh]);

  const byChannel = presence.serverId === serverId ? presence.byChannel : EMPTY;
  return { byChannel, refresh };
}
