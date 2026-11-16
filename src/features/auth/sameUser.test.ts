import type { User } from "@discordia/client-shared";

import { sameUser } from "./sameUser";

const user: User = {
  id: "1",
  name: "Juana",
  email: "juana@example.com",
  description: "",
  avatar_url: "",
  status_text: "",
  status_emoji: "",
  premium: false,
  created_at: "2026-01-01T00:00:00Z",
};

describe("sameUser", () => {
  it("sin usuario previo siempre hay cambio", () => {
    expect(sameUser(null, user)).toBe(false);
  });

  it("la misma respuesta no cuenta como cambio", () => {
    expect(sameUser(user, { ...user })).toBe(true);
  });

  it("detecta que se cayó Premium", () => {
    expect(sameUser({ ...user, premium: true }, user)).toBe(false);
  });
});
