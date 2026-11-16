import { loadVoiceProfile } from "./voice-profiles";

const mockGetPublicProfile = jest.fn();

jest.mock("../profile/service", () => ({
  getPublicProfile: (...args: unknown[]) => mockGetPublicProfile(...args),
}));
jest.mock("../../lib/env", () => ({ env: { apiUrl: "https://api.test" } }));

function publicProfile(id: string, avatarUrl: string) {
  return {
    ok: true,
    user: {
      id,
      name: `Nombre ${id}`,
      avatar_url: avatarUrl,
      description: "",
      status_text: "",
      status_emoji: "",
    },
  };
}

beforeEach(() => {
  mockGetPublicProfile.mockReset();
  mockGetPublicProfile.mockImplementation(async (id: string) =>
    publicProfile(id, `https://cdn.test/${id}.png?v=1`),
  );
});

describe("loadVoiceProfile", () => {
  it("devuelve el nombre y la foto del perfil publico", async () => {
    await expect(loadVoiceProfile("u-ana")).resolves.toEqual({
      identity: "u-ana",
      name: "Nombre u-ana",
      avatarUrl: "https://cdn.test/u-ana.png?v=1",
    });
  });

  it("arma la URL absoluta cuando el back devuelve un path", async () => {
    mockGetPublicProfile.mockResolvedValueOnce(
      publicProfile("u-beto", "/uploads/u-beto.png"),
    );

    const profile = await loadVoiceProfile("u-beto");

    expect(profile?.avatarUrl).toBe("https://api.test/uploads/u-beto.png");
  });

  it("sin foto en el perfil, avatarUrl es null (se ve la inicial)", async () => {
    mockGetPublicProfile.mockResolvedValueOnce(publicProfile("u-caro", ""));

    const profile = await loadVoiceProfile("u-caro");

    expect(profile?.avatarUrl).toBeNull();
  });

  it("pide una sola vez por id aunque lo pidan varias pantallas", async () => {
    const [sidebar, grid] = await Promise.all([
      loadVoiceProfile("u-dani"),
      loadVoiceProfile("u-dani"),
    ]);
    await loadVoiceProfile("u-dani");

    expect(sidebar).toBe(grid);
    expect(mockGetPublicProfile).toHaveBeenCalledTimes(1);
  });

  it("si falla devuelve null y la proxima vez lo vuelve a pedir", async () => {
    mockGetPublicProfile.mockResolvedValueOnce({ ok: false, message: "x" });

    await expect(loadVoiceProfile("u-eli")).resolves.toBeNull();
    await expect(loadVoiceProfile("u-eli")).resolves.toMatchObject({
      identity: "u-eli",
    });
    expect(mockGetPublicProfile).toHaveBeenCalledTimes(2);
  });

  it("si el pedido tira error tambien lo reintenta despues", async () => {
    mockGetPublicProfile.mockRejectedValueOnce(new Error("sin red"));

    await expect(loadVoiceProfile("u-fede")).resolves.toBeNull();
    await expect(loadVoiceProfile("u-fede")).resolves.not.toBeNull();
  });

  it("no hace mas pedidos en paralelo que el tope", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    mockGetPublicProfile.mockImplementation(async (id: string) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return publicProfile(id, "");
    });

    await Promise.all(
      Array.from({ length: 15 }, (_, index) => loadVoiceProfile(`u-x${index}`)),
    );

    expect(maxInFlight).toBeLessThanOrEqual(6);
    expect(mockGetPublicProfile).toHaveBeenCalledTimes(15);
  });
});
