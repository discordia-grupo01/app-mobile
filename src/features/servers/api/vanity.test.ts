import { apiFetch } from "../../../lib/api-client";

import { setVanityCode, vanityLinkPrefix, vanityLinkText } from "./vanity";

jest.mock("../../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("setVanityCode", () => {
  it("manda el código y devuelve el que guardó servers", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { vanity_code: "club-lectura" },
    });

    expect(await setVanityCode("s1", "Club-Lectura")).toEqual({
      ok: true,
      vanity_code: "club-lectura",
    });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/vanity", {
      method: "PATCH",
      body: JSON.stringify({ code: "Club-Lectura" }),
    });
  });

  it("con null la quita", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { vanity_code: null },
    });

    await setVanityCode("s1", null);

    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/vanity", {
      method: "PATCH",
      body: JSON.stringify({ code: null }),
    });
  });

  it("traduce el 409 de un código tomado", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      code: 409,
      message: "taken",
      details: { field: "code", reason: "vanity_code_taken" },
    });

    expect(await setVanityCode("s1", "lectura")).toEqual({
      ok: false,
      message: "Ese link ya lo usa otro servidor. Probá con otro.",
    });
  });
});

describe("link de la URL personalizada", () => {
  it("usa el link de la app, no el de la web", () => {
    expect(vanityLinkText("taller")).toBe("discordia://invite/taller");
    expect(vanityLinkPrefix()).toBe("discordia://invite/");
  });
});
