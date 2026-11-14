import { BOOSTS_LOAD_ERROR } from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import { getServerBoostSummary } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("getServerBoostSummary", () => {
  it("pide el resumen del servidor y lo normaliza", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        boost_count: 7,
        level: 1,
        perks_unlocked: ["extra_emoji_slots", "animated_icon"],
        next_level: { level: 2, boosts_required: 15, boosts_missing: 8 },
      },
    });

    expect(await getServerBoostSummary("s1")).toEqual({
      ok: true,
      summary: {
        boost_count: 7,
        level: 1,
        perks_unlocked: ["extra_emoji_slots", "animated_icon"],
        next_level: { level: 2, boosts_required: 15, boosts_missing: 8 },
      },
    });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/boosts", {
      method: "GET",
    });
  });

  it("si el back falla, devuelve el texto de error de boosts", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      code: 403,
      message: "forbidden",
    });

    expect(await getServerBoostSummary("s1")).toEqual({
      ok: false,
      message: BOOSTS_LOAD_ERROR,
    });
  });
});
