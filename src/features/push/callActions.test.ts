import {
  ACCEPT_CALL_ACTION,
  DECLINE_CALL_ACTION,
  pushCallActionOf,
} from "./callActions";

const data = { call_id: "call-1", caller_id: "ana", status: "ringing" };
const now = 1_000_000;

describe("pushCallActionOf", () => {
  it("lee Aceptar y Rechazar de una llamada que está sonando", () => {
    expect(
      pushCallActionOf({
        actionIdentifier: ACCEPT_CALL_ACTION,
        data,
        sentAt: now - 5_000,
        now,
      }),
    ).toEqual({ type: "accept", callId: "call-1", callerId: "ana" });

    expect(
      pushCallActionOf({
        actionIdentifier: DECLINE_CALL_ACTION,
        data,
        sentAt: now,
        now,
      }),
    ).toEqual({ type: "decline", callId: "call-1", callerId: "ana" });
  });

  it("ignora el toque en la notificación y otros botones", () => {
    for (const actionIdentifier of [
      "expo.modules.notifications.actions.DEFAULT",
      "otra_accion",
    ]) {
      expect(
        pushCallActionOf({ actionIdentifier, data, sentAt: now, now }),
      ).toBeNull();
    }
  });

  it("ignora un botón tocado cuando la llamada ya no puede estar sonando", () => {
    expect(
      pushCallActionOf({
        actionIdentifier: ACCEPT_CALL_ACTION,
        data,
        sentAt: now - 61_000,
        now,
      }),
    ).toBeNull();
  });

  it("ignora datos sin llamada", () => {
    for (const bad of [
      null,
      "call-1",
      { call_id: "call-1" },
      { call_id: "", caller_id: "ana" },
      { call_id: 1, caller_id: "ana" },
    ]) {
      expect(
        pushCallActionOf({
          actionIdentifier: ACCEPT_CALL_ACTION,
          data: bad,
          sentAt: now,
          now,
        }),
      ).toBeNull();
    }
  });
});
