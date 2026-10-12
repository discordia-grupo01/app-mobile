import {
  type ServerSummary,
  toVoicePresence,
  type VoicePresenceByChannel,
  withLivePresence,
} from "@discordia/client-shared";

import { useCallback, useMemo } from "react";

import { avatarUriOf } from "../../lib/userProfile";
import { useAuth } from "../auth/auth-context";
import { mockPresenceFor } from "./mockVoice";
import { useVoiceSession } from "./voice-session-context";
import { voiceParticipantsOf } from "./voiceSession";

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
    () =>
      voiceChannelId && user
        ? voiceParticipantsOf(state, { identity: user.id, name: user.name })
        : [],
    [voiceChannelId, user, state],
  );

  const presence: VoicePresenceByChannel = useMemo(() => {
    const polled = mockPresenceFor(server.channels);
    return voiceChannelId
      ? withLivePresence(
          polled,
          voiceChannelId,
          toVoicePresence(liveParticipants),
        )
      : polled;
  }, [server.channels, voiceChannelId, liveParticipants]);

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
