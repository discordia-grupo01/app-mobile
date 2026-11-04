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
  it("sigue mostrando la pantalla mientras la comparte", () => {
    expect(expandedIdentityAfter("u-ana:screen", [ana])).toBe("u-ana:screen");
  });

  it("sigue mostrando la camara mientras la tenga prendida", () => {
    expect(expandedIdentityAfter("u-ana", [{ ...ana, cameraOn: true }])).toBe(
      "u-ana",
    );
  });

  it("sale sola si la persona apaga el video", () => {
    expect(
      expandedIdentityAfter("u-ana:screen", [{ ...ana, screenSharing: false }]),
    ).toBeNull();
    expect(expandedIdentityAfter("u-ana", [ana])).toBeNull();
  });

  it("sale sola si la persona se fue de la llamada", () => {
    expect(expandedIdentityAfter("u-ana:screen", [])).toBeNull();
  });

  it("sin nadie ampliado no hace nada", () => {
    expect(expandedIdentityAfter(null, [ana])).toBeNull();
  });
});
