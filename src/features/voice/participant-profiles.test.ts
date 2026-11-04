import type {
  PrivateCallTarget,
  VoiceChannelTarget,
} from "@discordia/client-shared";

import { participantProfilesOf } from "./participant-profiles";

const me = { id: "u-ana", name: "Ana", avatarUrl: null };

const call: PrivateCallTarget = {
  kind: "private_call",
  callId: "call-1",
  conversationId: "conv-1",
  partnerId: "u-beto",
  partnerName: "Beto",
  partnerAvatarUrl: "https://cdn.example/beto.png",
};

const channel: VoiceChannelTarget = {
  kind: "channel",
  serverId: "s1",
  serverName: "Servidor",
  channelId: "c1",
  channelName: "General",
};

describe("participantProfilesOf", () => {
  it("en la llamada privada da el nombre y la foto de los dos", () => {
    expect(participantProfilesOf(call, me)).toEqual([
      { identity: "u-ana", name: "Ana", avatarUrl: null },
      {
        identity: "u-beto",
        name: "Beto",
        avatarUrl: "https://cdn.example/beto.png",
      },
    ]);
  });

  it("en un canal no manda nada: el nombre ya viene en el token", () => {
    expect(participantProfilesOf(channel, me)).toEqual([]);
  });

  it("sin llamada o sin sesion no manda nada", () => {
    expect(participantProfilesOf(null, me)).toEqual([]);
    expect(participantProfilesOf(call, null)).toEqual([]);
  });
});
