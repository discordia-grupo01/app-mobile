import { type AudioPlayer, createAudioPlayer } from "expo-audio";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RINGTONE = require("../../../assets/sounds/llamada_entrante.wav");

export function startRinging(): AudioPlayer | null {
  try {
    const player = createAudioPlayer(RINGTONE);
    player.loop = true;
    player.play();
    return player;
  } catch {
    return null;
  }
}

export function stopRinging(player: AudioPlayer | null): void {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    return;
  }
}
