import { createAudioPlayer } from "expo-audio";

import { playCallRejectedSound, playDisconnectSound } from "./sounds";

jest.mock("expo-audio", () => ({ createAudioPlayer: jest.fn() }));

const mockedCreate = createAudioPlayer as jest.Mock;

function fakePlayer() {
  return { loop: false, play: jest.fn(), pause: jest.fn(), remove: jest.fn() };
}

beforeEach(() => jest.resetAllMocks());

describe("sounds", () => {
  it("reproduce el sonido de desconectar", () => {
    const player = fakePlayer();
    mockedCreate.mockReturnValue(player);

    playDisconnectSound();
    expect(mockedCreate).toHaveBeenCalled();
    expect(player.play).toHaveBeenCalled();
  });

  it("reproduce el sonido de llamada rechazada", () => {
    const player = fakePlayer();
    mockedCreate.mockReturnValue(player);

    playCallRejectedSound();
    expect(mockedCreate).toHaveBeenCalled();
    expect(player.play).toHaveBeenCalled();
  });

  it("si falla el audio no lanza excepcion", () => {
    mockedCreate.mockImplementation(() => {
      throw new Error("error");
    });
    expect(() => playDisconnectSound()).not.toThrow();
    expect(() => playCallRejectedSound()).not.toThrow();
  });
});
