import {
  VOICE_PARTICIPANTS_POLL_MS,
  type VoicePresenceByChannel,
  type VoicePresenceParticipant,
} from "@discordia/client-shared";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { listVoiceParticipants } from "./api";

const EMPTY: VoicePresenceByChannel = {};

function withoutParticipant(
  byChannel: VoicePresenceByChannel,
  channelId: string,
  identity: string,
): VoicePresenceByChannel {
  const participants = byChannel[channelId];
  if (!participants) return byChannel;
  const rest = participants.filter(
    (participant) => participant.participant_id !== identity,
  );
  if (rest.length === participants.length) return byChannel;
  const result: Record<string, readonly VoicePresenceParticipant[]> = {
    ...byChannel,
  };
  if (rest.length > 0) result[channelId] = rest;
  else delete result[channelId];
  return result;
}

export function useVoicePresence(serverId: string | null): {
  byChannel: VoicePresenceByChannel;
  refresh: () => void;
  forget: (channelId: string, identity: string) => void;
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

  const forget = useCallback((channelId: string, identity: string) => {
    requestId.current += 1;
    setPresence((current) => ({
      ...current,
      byChannel: withoutParticipant(current.byChannel, channelId, identity),
    }));
  }, []);

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
  return { byChannel, refresh, forget };
}
