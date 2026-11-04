import {
  hasExpandableVideo,
  type VoiceParticipant,
} from "@discordia/client-shared";

export const EXPANDED_OVERLAY_HIDE_MS = 3000;

export function expandedIdentityAfter(
  expandedIdentity: string | null,
  participants: readonly VoiceParticipant[],
): string | null {
  if (!expandedIdentity) return null;
  return hasExpandableVideo(participants, expandedIdentity)
    ? expandedIdentity
    : null;
}
