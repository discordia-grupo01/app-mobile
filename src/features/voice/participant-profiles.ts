import type {
  VoiceParticipantProfile,
  VoiceSessionTarget,
} from "@discordia/client-shared";

interface CallMember {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export function participantProfilesOf(
  target: VoiceSessionTarget | null,
  me: CallMember | null,
): VoiceParticipantProfile[] {
  if (target?.kind !== "private_call" || !me) return [];
  return [
    { identity: me.id, name: me.name, avatarUrl: me.avatarUrl },
    {
      identity: target.partnerId,
      name: target.partnerName,
      avatarUrl: target.partnerAvatarUrl,
    },
  ];
}
