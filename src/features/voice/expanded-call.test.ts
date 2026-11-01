import type { VoiceParticipant } from "@discordia/client-shared";

import { expandedIdentityAfter } from "./expanded-call";

const ana: VoiceParticipant = {
  identity: "u-ana",
  name: "Ana",
  isLocal: false,
  muted: false,
  speaking: false,
  cameraOn: false,
  screenSharing: true,
  mutedForMe: false,
};

describe("expandedIdentityAfter", () => {
  it("sigue mostrando a quien todavia comparte o tiene camara", () => {
    expect(expandedIdentityAfter("u-ana", [ana])).toBe("u-ana");
    expect(
      expandedIdentityAfter("u-ana", [
        { ...ana, screenSharing: false, cameraOn: true },
      ]),
    ).toBe("u-ana");
  });

  it("sale sola si la persona apaga el video", () => {
    expect(
      expandedIdentityAfter("u-ana", [{ ...ana, screenSharing: false }]),
    ).toBeNull();
  });

  it("sale sola si la persona se fue de la llamada", () => {
    expect(expandedIdentityAfter("u-ana", [])).toBeNull();
  });

  it("sin nadie ampliado no hace nada", () => {
    expect(expandedIdentityAfter(null, [ana])).toBeNull();
  });
});
