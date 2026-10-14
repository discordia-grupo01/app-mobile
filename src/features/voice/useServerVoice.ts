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

  const polled = useVoicePresence(server.id);
  const refreshPresence = polled.refresh;
  const forgetParticipant = polled.forget;
  const status = state.status;
  useEffect(() => {
    if (status === "connected") refreshPresence();
  }, [voiceChannelId, status, refreshPresence]);

  const ownIdentity = user ? String(user.id) : null;
  const previousVoiceChannelId = useRef(voiceChannelId);
  useEffect(() => {
    const previous = previousVoiceChannelId.current;
    previousVoiceChannelId.current = voiceChannelId;
    if (previous && previous !== voiceChannelId && ownIdentity) {
      forgetParticipant(previous, ownIdentity);
    }
  }, [voiceChannelId, ownIdentity, forgetParticipant]);

  // Con la salida confirmada, ya se puede pedir la presencia real.
  useEffect(() => {
    if (leaveSettledCount > 0) refreshPresence();
  }, [leaveSettledCount, refreshPresence]);

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
