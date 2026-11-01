import type { VoicePresenceEvent } from "@discordia/client-shared";

import { applyPresenceEvent, type ServerPresence } from "./useVoicePresence";

jest.mock("./api", () => ({ listVoiceParticipants: jest.fn() }));
jest.mock("./socket", () => ({ connectVoicePresence: jest.fn() }));

const START = "2026-11-01T16:00:00.123Z";
const START_MS = Date.parse(START);

const empty: ServerPresence = { byChannel: {}, startsByChannel: {} };

function event(
  joined: boolean,
  room_started_at: string | null,
  participant_id = "u1",
): VoicePresenceEvent {
  return {
    event_type: joined ? "voice.participant_joined" : "voice.participant_left",
    server_id: "s1",
    room_id: "c1",
    participant_id,
    name: participant_id === "u1" ? "Ana" : "Beto",
    room_started_at,
  };
}

describe("applyPresenceEvent", () => {
  it("al entrar suma a la persona y toma el inicio de la llamada", () => {
    expect(applyPresenceEvent(empty, event(true, START), true)).toEqual({
      byChannel: { c1: [{ participant_id: "u1", name: "Ana" }] },
      startsByChannel: { c1: START_MS },
    });
  });

  it("si queda gente en el canal, el inicio no cambia", () => {
    const withTwo = applyPresenceEvent(
      applyPresenceEvent(empty, event(true, START), true),
      event(true, START, "u2"),
      true,
    );

    const afterFirstLeft = applyPresenceEvent(
      withTwo,
      event(false, START),
      false,
    );

    expect(afterFirstLeft.byChannel.c1).toEqual([
      { participant_id: "u2", name: "Beto" },
    ]);
    expect(afterFirstLeft.startsByChannel).toEqual({ c1: START_MS });
  });

  it("cuando el canal se vacia, la llamada termina", () => {
    const inCall = applyPresenceEvent(empty, event(true, START), true);

    expect(applyPresenceEvent(inCall, event(false, null), false)).toEqual({
      byChannel: {},
      startsByChannel: {},
    });
  });
});
