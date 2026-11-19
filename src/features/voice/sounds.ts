import { createAudioPlayer } from "expo-audio";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DISCONNECT_SOUND = require("../../../assets/sounds/desconectar.wav");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CALL_REJECTED_SOUND = require("../../../assets/sounds/llamada_rechazada.wav");

export function playDisconnectSound(): void {
  try {
    const player = createAudioPlayer(DISCONNECT_SOUND);
    player.play();
  } catch {
    // Si el reproductor no está disponible, no bloquea el flujo.
  }
}

export function playCallRejectedSound(): void {
  try {
    const player = createAudioPlayer(CALL_REJECTED_SOUND);
    player.play();
  } catch {
    // Si el reproductor no está disponible, no bloquea el flujo.
  }
}
