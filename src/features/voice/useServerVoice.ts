import {
  ownerOfScreenShareIdentity,
  type ServerSummary,
  toVoicePresence,
  type VoicePresenceByChannel,
  voiceParticipantsOf,
  voiceProfileIds,
  withLivePresence,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { avatarUriOf } from "../../lib/userProfile";
import { useAuth } from "../auth/auth-context";
import { channelTargetOf } from "./channel-target";
import { useVoiceSession } from "./voice-session-context";
import { useVoicePresence } from "./useVoicePresence";
import { useVoiceProfiles } from "./useVoiceProfiles";

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

  const channelTarget = channelTargetOf(state.target);
  const voiceChannelId =
    channelTarget?.serverId === server.id ? channelTarget.channelId : null;

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
  const ownId = user?.id ?? null;
  const voiceUserIds = useMemo(
    () => voiceProfileIds(presence, liveParticipants, ownId),
    [presence, liveParticipants, ownId],
  );
  const { avatarOf: otherAvatarOf } = useVoiceProfiles(voiceUserIds);
  const participantAvatarOf = useCallback(
    (identity: string) =>
      (ownerOfScreenShareIdentity(identity) ?? identity) === ownId
        ? ownAvatarUri
        : otherAvatarOf(identity),
    [ownId, ownAvatarUri, otherAvatarOf],
  );

  const participantsFor = useCallback(
    (channelId: string): SidebarVoiceParticipant[] => {
      if (channelId === voiceChannelId) {
        return liveParticipants.map((participant) => ({
          identity: participant.identity,
          name: participant.name,
          avatarUri: participant.isLocal
            ? ownAvatarUri
            : participantAvatarOf(participant.identity),
          muted: participant.muted,
          speaking: participant.speaking && !participant.mutedForMe,
          cameraOn: participant.cameraOn,
          screenSharing: participant.screenSharing,
        }));
      }
      return (presence[channelId] ?? []).map((participant) => ({
        identity: participant.participant_id,
        name: participant.name,
        avatarUri: participantAvatarOf(participant.participant_id),
      }));
    },
    [
      voiceChannelId,
      liveParticipants,
      presence,
      ownAvatarUri,
      participantAvatarOf,
    ],
  );

  return {
    voiceChannelId,
    status: state.status,
    liveParticipants,
    presence,
    callStartsByChannel: socketPresence.startsByChannel,
    participantsFor,
    participantAvatarOf,
  };
}
