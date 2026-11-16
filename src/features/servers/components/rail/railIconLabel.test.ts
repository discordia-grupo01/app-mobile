import {
  NO_UNREAD_FLAGS,
  UNREAD_MESSAGES_LABEL,
} from "@discordia/client-shared";

import { railIconLabel } from "./railIconLabel";

describe("railIconLabel", () => {
  it("un servidor suspendido lo dice, aunque tenga algo sin leer", () => {
    expect(
      railIconLabel("Truchos", { unread: true, mentionCount: 0 }, true),
    ).toBe("Truchos, suspendido");
  });

  it("avisa los no leídos sin menciones", () => {
    expect(
      railIconLabel("Truchos", { unread: true, mentionCount: 0 }, false),
    ).toBe(`Truchos, ${UNREAD_MESSAGES_LABEL.toLowerCase()}`);
  });

  it("sin nada pendiente es solo el nombre", () => {
    expect(railIconLabel("Truchos", NO_UNREAD_FLAGS, false)).toBe("Truchos");
  });
});
