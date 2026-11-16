import { callNotificationOf } from "./useCallForegroundService";

jest.mock("../../../modules/call-service", () => ({
  startCallService: jest.fn(),
  stopCallService: jest.fn(),
}));

describe("callNotificationOf", () => {
  it("nombra el canal y el servidor en una llamada de canal", () => {
    expect(
      callNotificationOf({
        kind: "channel",
        serverId: "s1",
        serverName: "Grupo 1",
        channelId: "c1",
        channelName: "general",
      }),
    ).toEqual({
      title: "En llamada en #general",
      text: "Grupo 1 · Tocá para volver a la llamada",
    });
  });

  it("nombra a la otra persona en una llamada privada", () => {
    expect(
      callNotificationOf({
        kind: "private_call",
        callId: "call1",
        conversationId: "dm1",
        partnerId: "u2",
        partnerName: "Juana",
        partnerAvatarUrl: null,
      }).title,
    ).toBe("En llamada con Juana");
  });
});
