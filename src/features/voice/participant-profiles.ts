import type {
  VoiceParticipantProfile,
  VoiceSessionTarget,
} from "@discordia/client-shared";

interface CallMember {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * En la llamada privada LiveKit conoce a cada uno solo por su id, asi que la
 * grilla del WebView necesita que la app le pase los nombres. En un canal el
 * token ya trae el nombre y no hace falta nada.
 */
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
