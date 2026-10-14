import {
  VOICE_CONNECT_FAILED,
  VOICE_PARTICIPANTS_FAILED,
  voiceErrorMessage,
} from "@discordia/client-shared";

import { apiFetchWithBody } from "../../lib/api-client";

import {
  leaveVoiceSession,
  listVoiceParticipants,
  requestVoiceToken,
} from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetchWithBody: jest.fn() }));

const mockedFetch = apiFetchWithBody as jest.MockedFunction<
  typeof apiFetchWithBody
>;

function failure(status: number, body: unknown) {
  return {
    result: { ok: false as const, status, code: status, message: "x" },
    body,
  };
}

beforeEach(() => mockedFetch.mockReset());

describe("requestVoiceToken", () => {
  it("pide el token con el id en el cuerpo", async () => {
    const token = {
      identity: "u1",
      name: "Ana",
      room_name: "voice:c1",
      token: "jwt",
      url: "wss://lk",
    };
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data: token },
      body: token,
    });

    expect(await requestVoiceToken("c1")).toEqual({ ok: true, token });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/token", {
      method: "POST",
      body: JSON.stringify({ channel_id: "c1" }),
    });
  });

  it("traduce el codigo de signaling", async () => {
    mockedFetch.mockResolvedValue(failure(403, { error: "voice_forbidden" }));

    expect(await requestVoiceToken("c1")).toEqual({
      ok: false,
      message: voiceErrorMessage("voice_forbidden"),
    });
  });

  it("sin codigo conocido usa el mensaje generico", async () => {
    mockedFetch.mockResolvedValue(failure(0, null));

    expect(await requestVoiceToken("c1")).toEqual({
      ok: false,
      message: VOICE_CONNECT_FAILED,
    });
  });
});

describe("leaveVoiceSession", () => {
  it("borra la sesion del canal", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 204, data: undefined },
      body: null,
    });

    expect(await leaveVoiceSession("c1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/session", {
      method: "DELETE",
      body: JSON.stringify({ channel_id: "c1" }),
    });
  });
});

describe("listVoiceParticipants", () => {
  it("agrupa por canal", async () => {
    const data = {
      server_id: "s1",
      channels: [
        {
          channel_id: "c1",
          participants: [{ participant_id: "u1", name: "Ana" }],
        },
      ],
    };
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data },
      body: data,
    });

    expect(await listVoiceParticipants("s 1")).toEqual({
      ok: true,
      byChannel: { c1: [{ participant_id: "u1", name: "Ana" }] },
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/voice/participants?server_id=s%201",
      { method: "GET" },
    );
  });

  it("si falla devuelve el mensaje", async () => {
    mockedFetch.mockResolvedValue(failure(502, null));

    expect(await listVoiceParticipants("s1")).toEqual({
      ok: false,
      message: VOICE_PARTICIPANTS_FAILED,
    });
  });
});
