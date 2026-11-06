import {
  OWN_PROFILE_FOREGROUND_REFRESH_MS,
  shouldRefreshOnForeground,
} from "./ownProfileRefresh";

describe("shouldRefreshOnForeground", () => {
  const lastFetchAt = 1_000_000;

  it("al volver a primer plano después de un minuto pide el perfil", () => {
    expect(
      shouldRefreshOnForeground(
        "active",
        lastFetchAt,
        lastFetchAt + OWN_PROFILE_FOREGROUND_REFRESH_MS,
      ),
    ).toBe(true);
  });

  it("si el último pedido es reciente no vuelve a pedir", () => {
    expect(
      shouldRefreshOnForeground("active", lastFetchAt, lastFetchAt + 5_000),
    ).toBe(false);
  });

  it("al irse a segundo plano no pide nada", () => {
    expect(
      shouldRefreshOnForeground(
        "background",
        lastFetchAt,
        lastFetchAt + OWN_PROFILE_FOREGROUND_REFRESH_MS * 2,
      ),
    ).toBe(false);
    expect(
      shouldRefreshOnForeground(
        "inactive",
        lastFetchAt,
        lastFetchAt + OWN_PROFILE_FOREGROUND_REFRESH_MS * 2,
      ),
    ).toBe(false);
  });
});
