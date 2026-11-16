import { createAudioPlayer } from "expo-audio";

import { startRinging, stopRinging } from "./ringtone";

jest.mock("expo-audio", () => ({ createAudioPlayer: jest.fn() }));

const mockedCreate = createAudioPlayer as jest.Mock;

function fakePlayer() {
  return { loop: false, play: jest.fn(), pause: jest.fn(), remove: jest.fn() };
}

beforeEach(() => jest.resetAllMocks());

describe("startRinging", () => {
  it("reproduce el ringtone en loop", () => {
    const player = fakePlayer();
    mockedCreate.mockReturnValue(player);

    expect(startRinging()).toBe(player);
    expect(player.loop).toBe(true);
    expect(player.play).toHaveBeenCalled();
  });

  it("si el audio falla la llamada sigue sin sonido", () => {
    mockedCreate.mockImplementation(() => {
      throw new Error("audio no disponible");
    });

    expect(startRinging()).toBeNull();
  });
});

describe("stopRinging", () => {
  it("corta el sonido y libera el reproductor", () => {
    const player = fakePlayer();

    stopRinging(player as never);

    expect(player.pause).toHaveBeenCalled();
    expect(player.remove).toHaveBeenCalled();
  });

  it("no hace nada si no habia reproductor", () => {
    expect(() => stopRinging(null)).not.toThrow();
  });
});
