import {
  PRIVATE_CALL_ACCEPT_FAILED,
  PRIVATE_CALL_END_FAILED,
  PRIVATE_CALL_FORBIDDEN,
  PRIVATE_CALL_INVALID_STATE,
  PRIVATE_CALL_START_FAILED,
  type PrivateCallTarget,
  VOICE_CONNECT_FAILED,
  VOICE_PARTICIPANTS_FAILED,
  VOICE_SCREEN_SHARE_FAILED,
  VOICE_SCREEN_SHARE_FORBIDDEN,
  type VoiceChannelTarget,
  voiceErrorMessage,
} from "@discordia/client-shared";

import { apiFetchWithBody } from "../../lib/api-client";

import {
  acceptPrivateCall,
  fetchVoiceSocketTicket,
  finishPrivateCall,
  rejectPrivateCall,
  startPrivateCall,
  leaveVoiceSession,
  listVoiceParticipants,
  requestScreenShareToken,
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
          started_at: "2026-11-01T16:00:00.123Z",
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
      startsByChannel: { c1: Date.parse("2026-11-01T16:00:00.123Z") },
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

  describe("fetchVoiceSocketTicket", () => {
    it("pide un ticket autenticado para el socket de presencia", async () => {
      mockedFetch.mockResolvedValue({
        result: { ok: true, status: 200, data: { ticket: "voice-ticket" } },
        body: { ticket: "voice-ticket" },
      });

      expect(await fetchVoiceSocketTicket()).toEqual({
        ok: true,
        ticket: "voice-ticket",
      });
      expect(mockedFetch).toHaveBeenCalledWith("/api/voice/socket-ticket", {
        method: "POST",
      });
    });

    it("informa cuando la sesion expiro", async () => {
      mockedFetch.mockResolvedValue(failure(401, { error: "unauthorized" }));

      expect(await fetchVoiceSocketTicket()).toEqual({
        ok: false,
        sessionExpired: true,
      });
    });
  });
});

describe("requestScreenShareToken", () => {
  const channel: VoiceChannelTarget = {
    kind: "channel",
    serverId: "s1",
    serverName: "Servidor",
    channelId: "c1",
    channelName: "General",
  };
  const privateCall: PrivateCallTarget = {
    kind: "private_call",
    callId: "call 1",
    conversationId: "conv-1",
    partnerId: "u2",
    partnerName: "Beto",
    partnerAvatarUrl: null,
  };
  const token = { identity: "u1:screen", token: "jwt", url: "wss://lk" };

  it("en un canal pide el token con el id del canal en el cuerpo", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data: token },
      body: token,
    });

    expect(await requestScreenShareToken(channel)).toEqual({
      ok: true,
      token,
    });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/screen-token", {
      method: "POST",
      body: JSON.stringify({ channel_id: "c1" }),
    });
  });

  it("en una llamada privada lo pide a la ruta de esa llamada", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data: token },
      body: token,
    });

    expect(await requestScreenShareToken(privateCall)).toEqual({
      ok: true,
      token,
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/voice/calls/call%201/screen-token",
      { method: "POST" },
    );
  });

  it("explica que un silenciado no puede compartir", async () => {
    mockedFetch.mockResolvedValue(
      failure(403, { error: "voice_screen_share_forbidden" }),
    );

    expect(await requestScreenShareToken(channel)).toEqual({
      ok: false,
      message: VOICE_SCREEN_SHARE_FORBIDDEN,
    });
  });

  it("avisa si la llamada ya no esta activa", async () => {
    mockedFetch.mockResolvedValue(
      failure(409, { error: "invalid_call_state" }),
    );

    expect(await requestScreenShareToken(privateCall)).toEqual({
      ok: false,
      message: PRIVATE_CALL_INVALID_STATE,
    });
  });

  it("sin codigo conocido usa el error generico de pantalla", async () => {
    mockedFetch.mockResolvedValue(failure(500, {}));

    expect(await requestScreenShareToken(channel)).toEqual({
      ok: false,
      message: VOICE_SCREEN_SHARE_FAILED,
    });
  });
});

const call = {
  call_id: "call-1",
  conversation_id: "conv-1",
  caller_id: "u1",
  recipient_id: "u2",
  room_name: "call:call-1",
  status: "ringing",
};

describe("startPrivateCall", () => {
  it("manda a quien se llama y la conversacion del DM", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 201, data: call },
      body: call,
    });

    expect(await startPrivateCall("u2", "conv-1")).toEqual({ ok: true, call });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/calls", {
      method: "POST",
      body: JSON.stringify({ recipient_id: "u2", conversation_id: "conv-1" }),
    });
  });

  it("traduce el codigo de signaling", async () => {
    mockedFetch.mockResolvedValue(
      failure(403, { error: "voice_call_forbidden" }),
    );

    expect(await startPrivateCall("u2", "conv-1")).toEqual({
      ok: false,
      message: PRIVATE_CALL_FORBIDDEN,
    });
  });

  it("falla si la respuesta no es una llamada", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 201, data: { call_id: "call-1" } },
      body: { call_id: "call-1" },
    });

    expect(await startPrivateCall("u2", "conv-1")).toEqual({
      ok: false,
      message: PRIVATE_CALL_START_FAILED,
    });
  });
});

describe("acceptPrivateCall", () => {
  it("devuelve la llamada con las credenciales de la sala", async () => {
    const accepted = {
      ...call,
      status: "active",
      token: "jwt",
      url: "wss://lk",
    };
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data: accepted },
      body: accepted,
    });

    expect(await acceptPrivateCall("call-1")).toEqual({
      ok: true,
      call: accepted,
    });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/calls/call-1/accept", {
      method: "POST",
    });
  });

  it("falla si faltan las credenciales", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 200, data: call },
      body: call,
    });

    expect(await acceptPrivateCall("call-1")).toEqual({
      ok: false,
      message: PRIVATE_CALL_ACCEPT_FAILED,
    });
  });
});

describe("rejectPrivateCall y finishPrivateCall", () => {
  it("rechaza con POST a /reject", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 204, data: undefined },
      body: null,
    });

    expect(await rejectPrivateCall("call-1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/calls/call-1/reject", {
      method: "POST",
    });
  });

  it("corta con POST a /finish", async () => {
    mockedFetch.mockResolvedValue({
      result: { ok: true, status: 204, data: undefined },
      body: null,
    });

    expect(await finishPrivateCall("call-1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/api/voice/calls/call-1/finish", {
      method: "POST",
    });
  });

  it("usa el mensaje generico si el back no manda codigo", async () => {
    mockedFetch.mockResolvedValue(failure(500, null));

    expect(await finishPrivateCall("call-1")).toEqual({
      ok: false,
      message: PRIVATE_CALL_END_FAILED,
    });
  });
});
