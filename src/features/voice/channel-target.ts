import type {
  VoiceChannelTarget,
  VoiceSessionTarget,
} from "@discordia/client-shared";

export function channelTargetOf(
  target: VoiceSessionTarget | null | undefined,
): VoiceChannelTarget | null {
  return target?.kind === "channel" ? target : null;
}
