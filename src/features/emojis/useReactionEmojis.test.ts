import type { ServerEmoji } from "@discordia/client-shared";

import { buildCustomEmojiPickerSections } from "./useCustomEmojiPicker";
import { resolveReactionPick } from "./useReactionEmojis";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const staticLocal: ServerEmoji = {
  id: "e-mate",
  server_id: "s1",
  name: "mate",
  animated: false,
  image_url: "/mate.png",
  created_by: "u1",
  created_at: "2026-11-17T00:00:00Z",
};

const animatedLocal: ServerEmoji = {
  id: "e-festejo",
  server_id: "s1",
  name: "festejo",
  animated: true,
  image_url: "/festejo.gif",
  created_by: "u1",
  created_at: "2026-11-17T00:00:00Z",
};

const otherServerEmoji: ServerEmoji = {
  id: "e-perro",
  server_id: "s2",
  name: "perro",
  animated: false,
  image_url: "/perro.png",
  created_by: "u2",
  created_at: "2026-11-17T00:00:00Z",
};

const catalogServers = [
  { id: "s1", name: "Servidor 1", icon_url: null },
  { id: "s2", name: "Servidor 2", icon_url: null },
];

const byServer = {
  s1: [staticLocal, animatedLocal],
  s2: [otherServerEmoji],
};

describe("resolveReactionPick", () => {
  it("si el emoji no existe devuelve unknown", () => {
    expect(resolveReactionPick(undefined, false)).toEqual({ kind: "unknown" });
  });

  it("si esta bloqueado por falta de premium devuelve premium", () => {
    expect(resolveReactionPick(animatedLocal, true)).toEqual({
      kind: "premium",
    });
  });

  it("si no esta bloqueado devuelve el token listo para el backend", () => {
    expect(resolveReactionPick(staticLocal, false)).toEqual({
      kind: "react",
      token: "<:mate:e-mate>",
    });
    expect(resolveReactionPick(animatedLocal, false)).toEqual({
      kind: "react",
      token: "<a:festejo:e-festejo>",
    });
  });
});

describe("buildCustomEmojiPickerSections", () => {
  it("ordena primero el servidor del canal actual", () => {
    const { sections } = buildCustomEmojiPickerSections({
      servers: catalogServers,
      byServer,
      serverId: "s2",
      isPremium: false,
    });

    expect(sections[0].serverId).toBe("s2");
    expect(sections[1].serverId).toBe("s1");
  });

  it("sin premium marca bloqueados los animados y los de otros servidores", () => {
    const { sections, hasLocked } = buildCustomEmojiPickerSections({
      servers: catalogServers,
      byServer,
      serverId: "s1",
      isPremium: false,
    });

    expect(hasLocked).toBe(true);

    const s1Emojis = sections.find((s) => s.serverId === "s1")!.emojis;
    expect(s1Emojis.find((e) => e.emoji.id === "e-mate")!.isLocked).toBe(false);
    expect(s1Emojis.find((e) => e.emoji.id === "e-festejo")!.isLocked).toBe(
      true,
    );

    const s2Emojis = sections.find((s) => s.serverId === "s2")!.emojis;
    expect(s2Emojis.find((e) => e.emoji.id === "e-perro")!.isLocked).toBe(true);
  });

  it("con premium desbloquea todos los emojis", () => {
    const { sections, hasLocked } = buildCustomEmojiPickerSections({
      servers: catalogServers,
      byServer,
      serverId: "s1",
      isPremium: true,
    });

    expect(hasLocked).toBe(false);
    for (const section of sections) {
      for (const item of section.emojis) {
        expect(item.isLocked).toBe(false);
      }
    }
  });

  it("en mensaje directo (serverId null) todos los emojis piden premium sin premium", () => {
    const { sections, hasLocked } = buildCustomEmojiPickerSections({
      servers: catalogServers,
      byServer,
      serverId: null,
      isPremium: false,
    });

    expect(hasLocked).toBe(true);
    for (const section of sections) {
      for (const item of section.emojis) {
        expect(item.isLocked).toBe(true);
      }
    }
  });
});
