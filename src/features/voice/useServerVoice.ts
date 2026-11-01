import {
  type ServerSummary,
  toVoicePresence,
  type VoicePresenceByChannel,
  voiceParticipantsOf,
  withLivePresence,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useRef } from "react";

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
  const { state, leaveSettledCount } = useVoiceSession();
  const { user } = useAuth();

  const voiceChannelId =
    state.target?.serverId === server.id ? state.target.channelId : null;

  const liveParticipants = useMemo(
    () => (voiceChannelId ? voiceParticipantsOf(state) : []),
    [voiceChannelId, state],
  );

  const socketPresence = useVoicePresence(server.id);
  const { refresh: refreshPresence } = socketPresence;

  const lastLeaveSettled = useRef(leaveSettledCount);
  useEffect(() => {
    if (leaveSettledCount === lastLeaveSettled.current) return;
    lastLeaveSettled.current = leaveSettledCount;
    refreshPresence();
  }, [leaveSettledCount, refreshPresence]);

  const presence: VoicePresenceByChannel = useMemo(
    () =>
      voiceChannelId
        ? withLivePresence(
            socketPresence.byChannel,
            voiceChannelId,
            toVoicePresence(liveParticipants),
          )
        : socketPresence.byChannel,
    [socketPresence.byChannel, voiceChannelId, liveParticipants],
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
    callStartsByChannel: socketPresence.startsByChannel,
    participantsFor,
  };
}
