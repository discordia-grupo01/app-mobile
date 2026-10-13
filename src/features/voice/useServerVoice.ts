import {
  type ServerSummary,
  toVoicePresence,
  type VoicePresenceByChannel,
  voiceParticipantsOf,
  withLivePresence,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo } from "react";

import { avatarUriOf } from "../../lib/userProfile";
import { useAuth } from "../auth/auth-context";
import { useVoiceSession } from "./voice-session-context";
import { useVoicePresence } from "./useVoicePresence";

export interface SidebarVoiceParticipant {
  identity: string;
  name: string;
  avatarUri?: string | null;
  muted?: boolean;
  speaking?: boolean;
  cameraOn?: boolean;
  screenSharing?: boolean;
}

export function useServerVoice(server: ServerSummary) {
  const { state } = useVoiceSession();
  const { user } = useAuth();

  const voiceChannelId =
    state.target?.serverId === server.id ? state.target.channelId : null;

  const liveParticipants = useMemo(
    () => (voiceChannelId ? voiceParticipantsOf(state) : []),
    [voiceChannelId, state],
  );

  const polled = useVoicePresence(server.id);
  const refreshPresence = polled.refresh;
  // Al entrar o salir, la lista del canal que se deja se actualiza ya.
  const status = state.status;
  useEffect(() => {
    refreshPresence();
  }, [voiceChannelId, status, refreshPresence]);

  const presence: VoicePresenceByChannel = useMemo(
    () =>
      voiceChannelId
        ? withLivePresence(
            polled.byChannel,
            voiceChannelId,
            toVoicePresence(liveParticipants),
          )
        : polled.byChannel,
    [polled.byChannel, voiceChannelId, liveParticipants],
  );

  const ownAvatarUri = avatarUriOf(user);

  const participantsFor = useCallback(
    (channelId: string): SidebarVoiceParticipant[] => {
      if (channelId === voiceChannelId) {
        return liveParticipants.map((participant) => ({
          identity: participant.identity,
          name: participant.name,
          avatarUri: participant.isLocal ? ownAvatarUri : null,
          muted: participant.muted,
          speaking: participant.speaking && !participant.mutedForMe,
          cameraOn: participant.cameraOn,
          screenSharing: participant.screenSharing,
        }));
      }
      return (presence[channelId] ?? []).map((participant) => ({
        identity: participant.participant_id,
        name: participant.name,
      }));
    },
    [voiceChannelId, liveParticipants, presence, ownAvatarUri],
  );

  return {
    voiceChannelId,
    status: state.status,
    liveParticipants,
    presence,
    participantsFor,
  };
}
